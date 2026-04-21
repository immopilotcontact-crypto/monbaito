-- Ratings: students rate employers per offer (optional, one per user per offer)
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES raw_offers(id) ON DELETE CASCADE,
  response_speed smallint CHECK (response_speed BETWEEN 1 AND 5),
  satisfaction   smallint CHECK (satisfaction   BETWEEN 1 AND 5),
  trust          smallint CHECK (trust          BETWEEN 1 AND 5),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, offer_id)
);

-- Average per offer (live view)
CREATE OR REPLACE VIEW offer_rating_stats AS
SELECT
  offer_id,
  COUNT(*)                                    AS total_ratings,
  ROUND(AVG(response_speed)::numeric, 1)      AS avg_response_speed,
  ROUND(AVG(satisfaction)::numeric, 1)        AS avg_satisfaction,
  ROUND(AVG(trust)::numeric, 1)               AS avg_trust,
  ROUND(
    (AVG(response_speed) + AVG(satisfaction) + AVG(trust)) / 3.0, 1
  )                                           AS avg_overall
FROM ratings
WHERE response_speed IS NOT NULL
  AND satisfaction   IS NOT NULL
  AND trust          IS NOT NULL
GROUP BY offer_id;

-- RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_select_all" ON ratings
  FOR SELECT USING (true);

CREATE POLICY "ratings_insert_own" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_update_own" ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ratings_delete_own" ON ratings
  FOR DELETE USING (auth.uid() = user_id);
