-- Career score calculation for one user based on weighted skills.
-- Usage:
--   SELECT * FROM calculate_career_score('<user-uuid>');

CREATE OR REPLACE FUNCTION calculate_career_score(p_user_id TEXT)
RETURNS TABLE (
  user_id TEXT,
  aiml_engineer_pct NUMERIC(5,2),
  backend_dev_pct NUMERIC(5,2),
  analyst_pct NUMERIC(5,2),
  fullstack_dev_pct NUMERIC(5,2),
  data_analyst_pct NUMERIC(5,2)
)
LANGUAGE sql
AS $$
WITH user_skills AS (
  SELECT lower(trim(skill)) AS skill
  FROM users u
  CROSS JOIN LATERAL unnest(u.skills) AS skill
  WHERE u.id = p_user_id
),
matched AS (
  SELECT
    COALESCE(SUM(sw.aiml_weight), 0) AS aiml_sum,
    COALESCE(SUM(sw.backend_weight), 0) AS backend_sum,
    COALESCE(SUM(sw.analyst_weight), 0) AS analyst_sum,
    COALESCE(SUM(sw.fullstack_weight), 0) AS fullstack_sum,
    COALESCE(SUM(sw.data_analyst_weight), 0) AS data_analyst_sum
  FROM user_skills us
  JOIN skill_weights sw
    ON lower(sw.skill_name) = us.skill
),
totals AS (
  SELECT
    NULLIF(SUM(sw.aiml_weight), 0) AS aiml_total,
    NULLIF(SUM(sw.backend_weight), 0) AS backend_total,
    NULLIF(SUM(sw.analyst_weight), 0) AS analyst_total,
    NULLIF(SUM(sw.fullstack_weight), 0) AS fullstack_total,
    NULLIF(SUM(sw.data_analyst_weight), 0) AS data_analyst_total
  FROM skill_weights sw
)
SELECT
  p_user_id AS user_id,
  ROUND(((m.aiml_sum / t.aiml_total) * 100)::numeric, 2) AS aiml_engineer_pct,
  ROUND(((m.backend_sum / t.backend_total) * 100)::numeric, 2) AS backend_dev_pct,
  ROUND(((m.analyst_sum / t.analyst_total) * 100)::numeric, 2) AS analyst_pct,
  ROUND(((m.fullstack_sum / t.fullstack_total) * 100)::numeric, 2) AS fullstack_dev_pct,
  ROUND(((m.data_analyst_sum / t.data_analyst_total) * 100)::numeric, 2) AS data_analyst_pct
FROM matched m
CROSS JOIN totals t;
$$;
