# MonBaito

**L'agent IA qui trouve les vraies offres d'emploi étudiantes et détecte les arnaques.**

MonBaito est une PWA destinée aux étudiants français (lycée → Bac+5) qui cherchent un job, une alternance ou un stage. L'agent scanne les offres, attribue un Trust Score anti-arnaque, match les offres au profil de l'étudiant et génère des lettres de motivation personnalisées par IA.

---

## Stack technique

| Technologie | Usage |
|---|---|
| **Next.js 16** (App Router) | Framework full-stack |
| **React 19** | UI |
| **TypeScript** (strict) | Typage |
| **Tailwind CSS 4** | Styles |
| **Supabase** | PostgreSQL + Auth (magic link) + RLS + pgvector |
| **@supabase/ssr** | Auth côté serveur (middleware + Server Components) |
| **Anthropic Claude** | Haiku 4.5 (détection arnaques) + Opus 4.7 (lettres) |
| **OpenAI** | `text-embedding-3-small` pour les embeddings |
| **Stripe** | Paiement Pro (mensuel / annuel) |
| **Resend** | Emails transactionnels |
| **Upstash Redis** | Rate limiting distribué |
| **France Travail API** | Source d'offres officielle (OAuth2) |
| **INSEE SIRENE** | Vérification d'entreprises |
| **Vercel** | Déploiement + Cron Jobs |

---

## Installation locale

```bash
git clone https://github.com/TON_USERNAME/monbaito.git
cd monbaito
pnpm install
cp .env.local.example .env.local
# Remplis .env.local (voir ci-dessous)
pnpm dev
```

Site disponible sur **http://localhost:3000**

---

## Migrations SQL (dans l'ordre)

### 001 — Phase 1 : Waitlist

Exécuter dans Supabase SQL Editor :

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'landing',
  utm_source text, utm_medium text, utm_campaign text,
  user_agent text, ip_hash text,
  created_at timestamptz default now()
);
create index on public.waitlist (created_at desc);
create index on public.waitlist (email);
alter table public.waitlist enable row level security;
create policy "Insert ouvert pour tous" on public.waitlist for insert with check (true);
create policy "Lecture uniquement par service role" on public.waitlist for select using (auth.role() = 'service_role');
```

### 002 — Phase 2 : Produit complet

Exécuter le fichier `migrations/002.sql` dans Supabase SQL Editor.

Ce fichier crée :
- Extension `pgvector`
- Tables : `profiles`, `raw_offers`, `enriched_offers`, `user_matches`, `applications`, `offer_feedback`
- Index IVFFlat pour la similarité vectorielle
- RLS stricte sur toutes les tables
- Vue agrégée `company_feedback_stats`

---

## Variables d'environnement Vercel

| Variable | Description | Requis |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (⚠ côté serveur uniquement) | ✅ |
| `NEXT_PUBLIC_SITE_URL` | URL de production (`https://monbaito.fr`) | ✅ |
| `ANTHROPIC_API_KEY` | Clé API Anthropic | ✅ |
| `OPENAI_API_KEY` | Clé API OpenAI (embeddings) | ✅ |
| `RESEND_API_KEY` | Clé Resend (emails) | ✅ |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | ✅ |
| `STRIPE_PRICE_PRO_MONTHLY` | Price ID Stripe mensuel | ✅ |
| `STRIPE_PRICE_PRO_YEARLY` | Price ID Stripe annuel | ✅ |
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash | ✅ (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash | ✅ |
| `FRANCE_TRAVAIL_CLIENT_ID` | Client ID France Travail API | ✅ |
| `FRANCE_TRAVAIL_CLIENT_SECRET` | Secret France Travail API | ✅ |
| `INSEE_API_KEY` | Clé INSEE (vérif SIRENE) | Optionnel |
| `INSEE_API_SECRET` | Secret INSEE | Optionnel |
| `APIFY_API_TOKEN` | Token Apify (sources supplémentaires) | Phase 3 |
| `CRON_SECRET` | Secret pour sécuriser les crons (`openssl rand -hex 32`) | ✅ |

---

## Crons Vercel (vercel.json)

| Route | Schedule | Description |
|---|---|---|
| `/api/cron/scrape` | `0 */3 * * *` | Scraping toutes les 3h (France Travail + Apify) → score → match |
| `/api/cron/feedback-prompt` | `0 10 * * *` | Email feedback J+2 quotidien à 10h |

Le cron de scraping appelle en cascade `/api/cron/score` puis `/api/cron/match`.

---

## Endpoints API

### Auth
| Endpoint | Méthode | Description |
|---|---|---|
| `/auth/callback` | GET | Handler Supabase magic link |

### Scraping
| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/api/scraping/france-travail` | GET | CRON_SECRET | Scrape France Travail API (CDD/stage/alternance/saisonnier) |
| `/api/scraping/apify-sources` | GET | CRON_SECRET | Stub Apify (Phase 3) |

### Pipeline IA
| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/api/trust-score/compute` | POST | CRON_SECRET | Calcule Trust Score + embedding d'une offre |
| `/api/matching/compute` | POST | CRON_SECRET | Calcule les matchs user↔offre |

### Candidatures
| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/api/application/generate-letter` | POST | session | Génère lettre via Claude Opus 4.7 |
| `/api/application/mark-applied` | POST | session | Enregistre une candidature |

### Feedback
| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/api/feedback/submit` | POST | session | Soumet un feedback post-candidature |

### Stripe
| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/api/stripe/checkout` | POST | session | Crée une session Stripe Checkout |
| `/api/stripe/webhook` | POST | Stripe sig | Webhook (subscription activated/cancelled) |

### Utilisateur (RGPD)
| Endpoint | Méthode | Auth | Description |
|---|---|---|---|
| `/api/user/export` | GET | session | Export JSON de toutes les données |
| `/api/user/delete` | DELETE | session | Suppression de compte complète |
| `/api/user/parse-cv` | POST | session | Parse un PDF CV (multipart/form-data) |
| `/api/user/embed-cv` | POST | session | Génère l'embedding OpenAI du CV |

### Crons (appelés par Vercel)
| Endpoint | Description |
|---|---|
| `/api/cron/scrape` | Orchestrateur scraping |
| `/api/cron/score` | Enrichissement + Trust Score des nouvelles offres |
| `/api/cron/match` | Recalcul des matchs |
| `/api/cron/feedback-prompt` | Envoi emails J+2 |

---

## Checklist de test manuel

1. **Signup** : aller sur `/auth/login`, entrer son email, recevoir le magic link, cliquer dessus
2. **Onboarding** : wizard 4 étapes, upload CV optionnel, validation finale → profil créé en BDD
3. **Dashboard** : voir les offres matchées, filtrer par type, cliquer "Pas intéressé"
4. **Offre** : voir le Trust Score détaillé, les feedbacks agrégés
5. **Postuler** : cliquer "Postuler avec MonBaito", attendre la génération Claude Opus, éditer la lettre, copier + ouvrir l'offre originale, confirmer la candidature
6. **Candidatures** : voir la candidature listée, changer le statut
7. **Fiche entreprise** : aller sur `/entreprise/[siren]`, voir les stats agrégées
8. **Stripe** : aller sur `/settings/billing`, cliquer "Mensuel", passer en mode test Stripe, payer → tier Pro mis à jour
9. **Email feedback J+2** : déclencher manuellement `/api/cron/feedback-prompt` avec le header `Authorization: Bearer CRON_SECRET`
10. **Export RGPD** : aller sur `/profil`, cliquer "Télécharger mes données"
11. **RLS** : vérifier qu'un user connecté ne voit pas les matchs d'un autre user (via Supabase Table Editor)

---

## Estimation des coûts mensuels

| Service | 100 users | 500 users | 1000 users |
|---|---|---|---|
| Supabase (Pro) | 25 $ | 25 $ | 25 $ |
| Anthropic (Haiku scoring) | ~2 $ | ~10 $ | ~20 $ |
| Anthropic (Opus lettres, ~10% users) | ~5 $ | ~25 $ | ~50 $ |
| OpenAI (embeddings) | <1 $ | ~3 $ | ~6 $ |
| Vercel (Pro) | 20 $ | 20 $ | 20 $ |
| Upstash Redis | 0 $ (free) | 10 $ | 20 $ |
| Resend (emails) | 0 $ (free) | 0 $ | 5 $ |
| **Total** | **~53 $** | **~93 $** | **~146 $** |

À 4,99 €/mois, il suffit de **30 users Pro** pour couvrir les coûts fixes à 500 users.

---

## Roadmap

### Phase 1 ✅
- Landing page production, waitlist, PWA, SEO

### Phase 2 ✅ (actuelle)
- Auth magic link, onboarding, dashboard, offres, Trust Score, lettres IA, Stripe, emails feedback, fiche entreprise, RGPD

### Phase 3
- Sources Apify (Hellowork, JobTeaser)
- Blog SEO
- Notifications push
- Parrainage

---

© 2026 MonBaito — Morii — Tous droits réservés
