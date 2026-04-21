import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { scoreSalary } from "@/lib/salary-benchmarks";

export interface TrustReason {
  type: "company" | "salary" | "scam" | "url";
  severity: "positive" | "neutral" | "warning" | "critical";
  message: string;
  points: number;
}

export interface TrustScoreResult {
  score: number;
  reasons: TrustReason[];
  companyVerified: boolean;
  sireneData: Record<string, unknown> | null;
  isScamLikely: boolean;
}

interface OfferInput {
  companyName?: string | null;
  siren?: string | null;
  salaryMin?: number | null;
  salaryPeriod?: string | null;
  contractType?: string | null;
  description?: string | null;
  applyUrl?: string | null;
}

// ----------------------------------------------------------------
// Étape 1 : Vérification SIRENE
// ----------------------------------------------------------------
async function checkSirene(
  companyName: string | null | undefined
): Promise<{ points: number; reason: TrustReason; sireneData: Record<string, unknown> | null; verified: boolean }> {
  if (!companyName || !process.env.INSEE_API_KEY) {
    return {
      points: 0,
      reason: { type: "company", severity: "neutral", message: "Entreprise non vérifiée (SIRENE non configuré)", points: 0 },
      sireneData: null,
      verified: false,
    };
  }

  try {
    const tokenRes = await fetch(
      `https://api.insee.fr/token?grant_type=client_credentials`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.INSEE_API_KEY}:${process.env.INSEE_API_SECRET}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );
    if (!tokenRes.ok) throw new Error("INSEE token failed");
    const { access_token } = await tokenRes.json();

    const searchRes = await fetch(
      `https://api.insee.fr/entreprises/sirene/V3.11/siren?q=denominationUniteLegale:"${encodeURIComponent(companyName)}"&nombre=1`,
      { headers: { Authorization: `Bearer ${access_token}`, Accept: "application/json" } }
    );
    if (!searchRes.ok) throw new Error("SIRENE search failed");
    const data = await searchRes.json();
    const unite = data.unitesLegales?.[0];
    if (!unite) {
      return {
        points: 0,
        reason: { type: "company", severity: "warning", message: `Entreprise "${companyName}" introuvable dans SIRENE`, points: 0 },
        sireneData: null,
        verified: false,
      };
    }

    const createdYear = parseInt(unite.dateCreationUniteLegale?.substring(0, 4) ?? "0");
    const age = new Date().getFullYear() - createdYear;
    const etat = unite.periodesUniteLegale?.[0]?.etatAdministratifUniteLegale;
    const active = etat === "A";

    const points = active && age >= 2 ? 25 : active ? 15 : 0;
    const message = active
      ? `Entreprise active dans SIRENE — créée en ${createdYear} (${age} an${age > 1 ? "s" : ""})`
      : "Entreprise radiée ou cessation d'activité";

    return {
      points,
      reason: { type: "company", severity: points >= 20 ? "positive" : points > 0 ? "neutral" : "warning", message, points },
      sireneData: unite,
      verified: active,
    };
  } catch {
    return {
      points: 0,
      reason: { type: "company", severity: "neutral", message: "Vérification SIRENE temporairement indisponible", points: 0 },
      sireneData: null,
      verified: false,
    };
  }
}

// ----------------------------------------------------------------
// Étape 3 : Détection d'arnaque via Claude Haiku
// ----------------------------------------------------------------
interface ScamResult {
  scam_risk: number;
  patterns_detected: string[];
  reasoning: string;
}

async function detectScam(description: string): Promise<ScamResult> {
  if (!description || description.length < 50) {
    return { scam_risk: 0, patterns_detected: [], reasoning: "Description trop courte pour analyse" };
  }

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: MODELS.haiku,
    max_tokens: 300,
    system: `Tu analyses une offre d'emploi en français pour détecter des patterns d'arnaque courants visant les étudiants.
Patterns à identifier : MLM (pyramide de vente, "sois ton propre patron"), commission-only déguisé ("salaire motivant selon performances"), porte-à-porte non déclaré ("prospection terrain" sans lieu fixe), stage non-rémunéré illégal (plus de 2 mois sans gratification), frais à payer par le candidat ("kit de démarrage", "formation obligatoire payante"), demandes de données suspectes (IBAN avant embauche, pièce d'identité numérique sans raison).
Retourne UNIQUEMENT un JSON valide : { "scam_risk": 0-100, "patterns_detected": ["string"], "reasoning": "string (2 phrases max)" }`,
    messages: [{ role: "user", content: description.slice(0, 3000) }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as ScamResult;
  } catch {
    return { scam_risk: 0, patterns_detected: [], reasoning: "Analyse non disponible" };
  }
}

// ----------------------------------------------------------------
// Score principal
// ----------------------------------------------------------------
export async function computeTrustScore(offer: OfferInput): Promise<TrustScoreResult> {
  const reasons: TrustReason[] = [];
  let totalPoints = 0;

  // Étape 1 : SIRENE
  const { points: sirenePoints, reason: sireneReason, sireneData, verified } =
    await checkSirene(offer.companyName);
  reasons.push(sireneReason);
  totalPoints += sirenePoints;

  // Étape 2 : Cohérence salaire
  const salaryResult = scoreSalary(
    offer.salaryMin ?? null,
    offer.salaryPeriod ?? null,
    offer.contractType ?? "student"
  );
  const salaryReason: TrustReason = {
    type: "salary",
    severity: salaryResult.score >= 20 ? "positive" : salaryResult.score >= 10 ? "neutral" : "warning",
    message: salaryResult.message,
    points: salaryResult.score,
  };
  reasons.push(salaryReason);
  totalPoints += salaryResult.score;

  // Étape 3 : Détection arnaque Claude Haiku
  let isScamLikely = false;
  if (offer.description) {
    const scam = await detectScam(offer.description);
    isScamLikely = scam.scam_risk > 50;
    const scamPoints = scam.scam_risk < 20 ? 50 : scam.scam_risk <= 50 ? 0 : -50;
    const scamReason: TrustReason = {
      type: "scam",
      severity: scamPoints >= 50 ? "positive" : scamPoints === 0 ? "neutral" : "critical",
      message:
        scam.patterns_detected.length > 0
          ? `Patterns détectés : ${scam.patterns_detected.join(", ")}. ${scam.reasoning}`
          : scam.reasoning || "Aucun pattern d'arnaque détecté",
      points: scamPoints,
    };
    reasons.push(scamReason);
    totalPoints += scamPoints;
  }

  // Étape 4 : URL candidature
  if (offer.applyUrl) {
    const urlPoints = /^https:\/\//.test(offer.applyUrl) ? 10 : -10;
    reasons.push({
      type: "url",
      severity: urlPoints > 0 ? "positive" : "warning",
      message: urlPoints > 0 ? "URL de candidature sécurisée (HTTPS)" : "URL de candidature non sécurisée",
      points: urlPoints,
    });
    totalPoints += urlPoints;
  }

  const score = Math.max(0, Math.min(100, totalPoints));
  return { score, reasons, companyVerified: verified, sireneData, isScamLikely };
}
