-- migrations/003.sql
-- Ajout des colonnes phone et cover_letter_template sur profiles
-- Exécuter dans Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS cover_letter_template text;
