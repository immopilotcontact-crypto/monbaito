// Salaires médians de référence (MVP — à enrichir avec des données réelles)
// Sources : INSEE, DARES, SMIC 2024 = 11,65 €/h, SMIC 2025 = ~11,88 €/h

export interface SalaryBenchmark {
  contractType: string;
  period: "hour" | "month";
  median: number;
  p25: number;
  p75: number;
}

const BENCHMARKS: SalaryBenchmark[] = [
  // Jobs étudiants (temps partiel)
  { contractType: "student", period: "hour", median: 11.88, p25: 11.65, p75: 13.5 },
  // Alternances
  { contractType: "alternance", period: "month", median: 900, p25: 700, p75: 1200 },
  // Stages
  { contractType: "internship", period: "month", median: 600, p25: 508, p75: 900 },
  // Saisonniers
  { contractType: "seasonal", period: "hour", median: 12.5, p25: 11.88, p75: 15 },
];

export function getSalaryBenchmark(contractType: string): SalaryBenchmark | null {
  return BENCHMARKS.find((b) => b.contractType === contractType) ?? null;
}

export function scoreSalary(
  salaryMin: number | null,
  salaryPeriod: string | null,
  contractType: string
): { score: number; message: string } {
  if (!salaryMin || !salaryPeriod) {
    return { score: 50, message: "Salaire non précisé" };
  }

  const benchmark = getSalaryBenchmark(contractType);
  if (!benchmark) return { score: 50, message: "Type de contrat non référencé" };

  // Normalise en période comparable
  const hourly =
    salaryPeriod === "hour"
      ? salaryMin
      : salaryPeriod === "month"
      ? salaryMin / 151.67
      : salaryMin / 1820;

  const benchmarkHourly =
    benchmark.period === "hour"
      ? benchmark.median
      : benchmark.median / 151.67;

  const ratio = hourly / benchmarkHourly;

  if (ratio < 0.9) return { score: 10, message: `Salaire inférieur au marché (${salaryMin}€/${salaryPeriod === 'hour' ? 'h' : 'mois'})` };
  if (ratio > 2.0) return { score: 20, message: "Salaire anormalement élevé — possible arnaque" };
  if (ratio >= 0.9 && ratio <= 1.1) return { score: 25, message: `Salaire conforme au marché (médiane ${benchmark.median}€/${benchmark.period === 'hour' ? 'h' : 'mois'})` };
  return { score: 20, message: `Salaire légèrement ${ratio > 1 ? 'supérieur' : 'inférieur'} au marché` };
}
