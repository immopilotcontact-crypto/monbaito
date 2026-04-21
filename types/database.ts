// Types Supabase — Phase 1 + Phase 2

export interface WaitlistRow {
  id: string;
  email: string;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  level: "lycee" | "bts" | "licence" | "master" | "ecole_inge" | "ecole_commerce" | "autre" | null;
  field: string | null;
  city: string | null;
  postal_code: string | null;
  mobility_km: number;
  availability: Record<string, boolean>;
  looking_for: {
    student_job: boolean;
    alternance: boolean;
    internship: boolean;
    seasonal: boolean;
  };
  min_hourly_rate: number;
  red_flags: string[];
  phone: string | null;
  cv_text: string | null;
  cv_embedding: number[] | null;
  cover_letter_template: string | null;
  tier: "free" | "pro";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawOfferRow {
  id: string;
  source: string;
  source_id: string | null;
  url: string | null;
  title: string;
  company_name: string | null;
  company_siren: string | null;
  description: string | null;
  salary_raw: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: "hour" | "month" | "year" | null;
  location_city: string | null;
  location_postal: string | null;
  location_lat: number | null;
  location_lng: number | null;
  contract_type: "student" | "alternance" | "internship" | "seasonal" | "other" | null;
  posted_at: string | null;
  scraped_at: string;
  raw_data: Record<string, unknown>;
}

export interface TrustReason {
  type: "company" | "salary" | "scam" | "url";
  severity: "positive" | "neutral" | "warning" | "critical";
  message: string;
  points: number;
}

export interface EnrichedOfferRow {
  id: string;
  raw_offer_id: string;
  trust_score: number | null;
  trust_reasons: TrustReason[];
  salary_score: number | null;
  company_verified: boolean;
  sirene_data: Record<string, unknown> | null;
  description_embedding: number[] | null;
  is_scam_likely: boolean;
  contract_type_clean: string | null;
  enriched_at: string;
}

export interface MatchReason {
  type: "embedding" | "availability" | "trust" | "salary";
  label: string;
  score: number;
}

export interface UserMatchRow {
  id: string;
  user_id: string;
  offer_id: string;
  match_score: number | null;
  match_reasons: MatchReason[];
  distance_km: number | null;
  dismissed: boolean;
  applied_at: string | null;
  letter_generated: string | null;
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  user_id: string;
  offer_id: string;
  letter_text: string | null;
  applied_at: string;
  status: "sent" | "replied" | "interview" | "hired" | "rejected" | "ghosted";
}

export interface OfferFeedbackRow {
  id: string;
  match_id: string | null;
  user_id: string;
  response_received: boolean | null;
  response_days: number | null;
  was_scam: boolean | null;
  actual_hourly_rate: number | null;
  manager_quality: number | null;
  would_recommend: boolean | null;
  notes: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      waitlist: {
        Row: WaitlistRow;
        Insert: Omit<WaitlistRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<WaitlistRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      raw_offers: {
        Row: RawOfferRow;
        Insert: Omit<RawOfferRow, "id" | "scraped_at"> & { id?: string; scraped_at?: string };
        Update: Partial<RawOfferRow>;
        Relationships: [];
      };
      enriched_offers: {
        Row: EnrichedOfferRow;
        Insert: Omit<EnrichedOfferRow, "id" | "enriched_at"> & { id?: string; enriched_at?: string };
        Update: Partial<EnrichedOfferRow>;
        Relationships: [];
      };
      user_matches: {
        Row: UserMatchRow;
        Insert: Omit<UserMatchRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<UserMatchRow>;
        Relationships: [];
      };
      applications: {
        Row: ApplicationRow;
        Insert: Omit<ApplicationRow, "id" | "applied_at"> & { id?: string; applied_at?: string };
        Update: Partial<ApplicationRow>;
        Relationships: [];
      };
      offer_feedback: {
        Row: OfferFeedbackRow;
        Insert: Omit<OfferFeedbackRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<OfferFeedbackRow>;
        Relationships: [];
      };
    };
    Views: {
      company_feedback_stats: {
        Row: {
          company_siren: string;
          company_name: string | null;
          total_applications: number;
          responses_received: number;
          response_rate_pct: number | null;
          avg_response_days: number | null;
          avg_manager_quality: number | null;
          scam_reports: number;
          avg_actual_hourly_rate: number | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type EnrichedOfferWithRaw = EnrichedOfferRow & { raw_offers: RawOfferRow };
export type UserMatchWithOffer = UserMatchRow & {
  enriched_offers: EnrichedOfferRow & { raw_offers: RawOfferRow };
};
