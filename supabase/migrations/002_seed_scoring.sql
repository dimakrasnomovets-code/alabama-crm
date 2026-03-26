-- =============================================
-- Seed: Scoring Configuration
-- =============================================

-- Occupancy scoring
INSERT INTO public.scoring_config (category, option_value, points, sort_order) VALUES
  ('occupancy', 'O/O', 10, 1),
  ('occupancy', 'Tenant', 6, 2),
  ('occupancy', 'Vacant', 3, 3),
  ('occupancy', 'Unknown', 1, 4);

-- Motivation scoring
INSERT INTO public.scoring_config (category, option_value, points, sort_order) VALUES
  ('motivation', 'High', 10, 1),
  ('motivation', 'Med', 6, 2),
  ('motivation', 'Low', 3, 3),
  ('motivation', 'Unknown', 1, 4);

-- Title complexity scoring (lower complexity = higher score)
INSERT INTO public.scoring_config (category, option_value, points, sort_order) VALUES
  ('title', 'Simple', 10, 1),
  ('title', 'Moderate', 6, 2),
  ('title', 'Complex', 3, 3),
  ('title', 'Unknown', 1, 4);

-- Contactability scoring
INSERT INTO public.scoring_config (category, option_value, points, sort_order) VALUES
  ('contactability', 'Strong', 10, 1),
  ('contactability', 'Some', 6, 2),
  ('contactability', 'Weak', 3, 3),
  ('contactability', '0', 0, 4);

-- Timing scoring (days to sale)
INSERT INTO public.scoring_config (category, option_value, points, sort_order) VALUES
  ('timing', '45+', 10, 1),
  ('timing', '30-45', 8, 2),
  ('timing', '14-30', 5, 3),
  ('timing', '<14', 2, 4),
  ('timing', 'Post-sale', 0, 5);

-- Equity scoring (equity margin %)
INSERT INTO public.scoring_config (category, option_value, points, sort_order) VALUES
  ('equity', '30%+', 10, 1),
  ('equity', '20-30%', 7, 2),
  ('equity', '10-20%', 4, 3),
  ('equity', '<10%', 1, 4);

-- Tax delinquent scoring
INSERT INTO public.scoring_config (category, option_value, points, sort_order) VALUES
  ('tax', 'Yes', 8, 1),
  ('tax', 'No', 3, 2),
  ('tax', 'Unknown', 1, 3);

-- =============================================
-- Seed: Tier Thresholds
-- =============================================
INSERT INTO public.tier_thresholds (tier_name, min_score) VALUES
  ('Tier 1', 50),
  ('Tier 2', 35),
  ('Tier 3', 20),
  ('Tier 4', 0);

-- =============================================
-- Seed: Alabama Counties (no demo leads per user request)
-- =============================================
INSERT INTO public.counties (name, priority, is_active) VALUES
  ('Jefferson', 'Primary', true),
  ('Madison', 'Primary', true),
  ('Mobile', 'Primary', true),
  ('Montgomery', 'Secondary', true),
  ('Shelby', 'Secondary', true),
  ('Tuscaloosa', 'Secondary', true),
  ('Baldwin', 'Watchlist', true),
  ('Lee', 'Watchlist', true),
  ('Morgan', 'Watchlist', true),
  ('Calhoun', 'Watchlist', true),
  ('Etowah', 'Watchlist', false),
  ('Houston', 'Watchlist', false);
