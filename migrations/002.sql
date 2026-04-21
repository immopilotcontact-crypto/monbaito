-- migrations/002.sql
-- Phase 2 : Produit complet Strada
-- Prérequis : migrations/001.sql (table waitlist) déjà exécutée
-- Exécuter dans l'ordre via Supabase SQL Editor ou CLI

-- ============================================================
-- EXTENSION pgvector
-- ============================================================
create extension if not exists vector with schema extensions;

-- ============================================================
-- HELPER : updated_at automatique
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  first_name text,
  last_name text,
  level text check (level in ('lycee','bts','licence','master','ecole_inge','ecole_commerce','autre')),
  field text,
  city text,
  postal_code text,
  mobility_km integer default 30 check (mobility_km > 0),
  availability jsonb default '{}',
  looking_for jsonb default '{"student_job":true,"alternance":false,"internship":false,"seasonal":false}',
  min_hourly_rate numeric(6,2) default 11.88,
  red_flags text[] default '{}',
  cv_text text,
  cv_embedding vector(1536),
  tier text default 'free' check (tier in ('free','pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- RAW OFFERS
-- ============================================================
create table public.raw_offers (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text,
  url text,
  title text not null,
  company_name text,
  company_siren text,
  description text,
  salary_raw text,
  salary_min numeric(8,2),
  salary_max numeric(8,2),
  salary_period text check (salary_period in ('hour','month','year')),
  location_city text,
  location_postal text,
  location_lat numeric(9,6),
  location_lng numeric(9,6),
  contract_type text check (contract_type in ('student','alternance','internship','seasonal','other')),
  posted_at timestamptz,
  scraped_at timestamptz default now(),
  raw_data jsonb default '{}',
  unique(source, source_id)
);

create index raw_offers_scraped_at_idx on public.raw_offers (scraped_at desc);
create index raw_offers_location_city_idx on public.raw_offers (location_city);
create index raw_offers_contract_type_idx on public.raw_offers (contract_type);

-- ============================================================
-- ENRICHED OFFERS
-- ============================================================
create table public.enriched_offers (
  id uuid primary key default gen_random_uuid(),
  raw_offer_id uuid not null references public.raw_offers on delete cascade,
  trust_score integer check (trust_score between 0 and 100),
  trust_reasons jsonb default '[]',
  salary_score integer check (salary_score between 0 and 100),
  company_verified boolean default false,
  sirene_data jsonb,
  description_embedding vector(1536),
  is_scam_likely boolean default false,
  contract_type_clean text,
  enriched_at timestamptz default now(),
  unique(raw_offer_id)
);

create index enriched_offers_embedding_idx on public.enriched_offers
  using ivfflat (description_embedding vector_cosine_ops)
  with (lists = 100);
create index enriched_offers_trust_score_idx on public.enriched_offers (trust_score desc);

-- ============================================================
-- USER MATCHES
-- ============================================================
create table public.user_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  offer_id uuid not null references public.enriched_offers on delete cascade,
  match_score numeric(5,2) check (match_score between 0 and 100),
  match_reasons jsonb default '[]',
  distance_km numeric(7,2),
  dismissed boolean default false,
  applied_at timestamptz,
  letter_generated text,
  created_at timestamptz default now(),
  unique(user_id, offer_id)
);

create index user_matches_user_score_idx on public.user_matches (user_id, match_score desc)
  where dismissed = false;
create index user_matches_user_applied_idx on public.user_matches (user_id, applied_at desc)
  where applied_at is not null;

-- ============================================================
-- APPLICATIONS
-- ============================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  offer_id uuid not null references public.enriched_offers on delete cascade,
  letter_text text,
  applied_at timestamptz default now(),
  status text default 'sent' check (status in ('sent','replied','interview','hired','rejected','ghosted'))
);

create index applications_user_applied_idx on public.applications (user_id, applied_at desc);

-- ============================================================
-- OFFER FEEDBACK
-- ============================================================
create table public.offer_feedback (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.user_matches on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  response_received boolean,
  response_days integer,
  was_scam boolean,
  actual_hourly_rate numeric(6,2),
  manager_quality integer check (manager_quality between 1 and 5),
  would_recommend boolean,
  notes text check (char_length(notes) <= 500),
  created_at timestamptz default now()
);

create index offer_feedback_user_idx on public.offer_feedback (user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.raw_offers enable row level security;
alter table public.enriched_offers enable row level security;
alter table public.user_matches enable row level security;
alter table public.applications enable row level security;
alter table public.offer_feedback enable row level security;

-- PROFILES : seulement son propre profil
create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own"
  on public.profiles for delete using (auth.uid() = id);

-- RAW OFFERS : lecture publique, écriture service_role uniquement
create policy "raw_offers_select_all"
  on public.raw_offers for select using (true);
create policy "raw_offers_insert_service"
  on public.raw_offers for insert with check (auth.role() = 'service_role');
create policy "raw_offers_update_service"
  on public.raw_offers for update using (auth.role() = 'service_role');
create policy "raw_offers_delete_service"
  on public.raw_offers for delete using (auth.role() = 'service_role');

-- ENRICHED OFFERS : lecture publique, écriture service_role
create policy "enriched_offers_select_all"
  on public.enriched_offers for select using (true);
create policy "enriched_offers_insert_service"
  on public.enriched_offers for insert with check (auth.role() = 'service_role');
create policy "enriched_offers_update_service"
  on public.enriched_offers for update using (auth.role() = 'service_role');

-- USER MATCHES : seulement ses propres matchs
create policy "user_matches_select_own"
  on public.user_matches for select using (auth.uid() = user_id);
create policy "user_matches_insert_service"
  on public.user_matches for insert with check (auth.role() = 'service_role');
create policy "user_matches_update_own_or_service"
  on public.user_matches for update
  using (auth.uid() = user_id or auth.role() = 'service_role');

-- APPLICATIONS : seulement les siennes
create policy "applications_select_own"
  on public.applications for select using (auth.uid() = user_id);
create policy "applications_insert_own"
  on public.applications for insert with check (auth.uid() = user_id);
create policy "applications_update_own"
  on public.applications for update using (auth.uid() = user_id);

-- OFFER FEEDBACK : seulement le sien
create policy "offer_feedback_select_own"
  on public.offer_feedback for select using (auth.uid() = user_id);
create policy "offer_feedback_insert_own"
  on public.offer_feedback for insert with check (auth.uid() = user_id);

-- ============================================================
-- VUE AGRÉGÉE ENTREPRISE (feedback anonymisé)
-- ============================================================
create or replace view public.company_feedback_stats as
select
  ro.company_siren,
  ro.company_name,
  count(distinct a.id) as total_applications,
  count(distinct f.id) filter (where f.response_received = true) as responses_received,
  round(
    count(distinct f.id) filter (where f.response_received = true) * 100.0 /
    nullif(count(distinct f.id), 0), 1
  ) as response_rate_pct,
  round(avg(f.response_days) filter (where f.response_days is not null), 1) as avg_response_days,
  round(avg(f.manager_quality) filter (where f.manager_quality is not null), 2) as avg_manager_quality,
  count(distinct f.id) filter (where f.was_scam = true) as scam_reports,
  round(avg(f.actual_hourly_rate) filter (where f.actual_hourly_rate is not null), 2) as avg_actual_hourly_rate
from public.raw_offers ro
join public.enriched_offers eo on eo.raw_offer_id = ro.id
join public.applications a on a.offer_id = eo.id
left join public.user_matches um on um.offer_id = eo.id
left join public.offer_feedback f on f.match_id = um.id
where ro.company_siren is not null
group by ro.company_siren, ro.company_name;
