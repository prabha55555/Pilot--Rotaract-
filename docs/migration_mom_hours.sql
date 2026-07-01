-- ============================================================
-- Migration: Add MOM, Hours Conducted, and Report URL
-- Run this inside the Supabase SQL Editor
-- ============================================================

ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS mom TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS hours_conducted NUMERIC;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS report_url VARCHAR(500);
