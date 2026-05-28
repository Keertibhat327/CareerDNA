-- ATS score function: compares student skills with a specific job's required skills.
-- Usage:
--   SELECT * FROM calculate_ats_score('<user-uuid>', '<job-uuid>');

CREATE OR REPLACE FUNCTION calculate_ats_score(p_user_id TEXT, p_job_id TEXT)
RETURNS TABLE (
  user_id TEXT,
  job_id TEXT,
  ats_score_pct NUMERIC(5,2),
  matched_skills TEXT[],
  missing_skills TEXT[]
)
LANGUAGE sql
AS $$
WITH user_skill_set AS (
  SELECT DISTINCT lower(trim(skill)) AS skill
  FROM users u
  CROSS JOIN LATERAL unnest(u.skills) AS skill
  WHERE u.id = p_user_id
),
job_skill_set AS (
  SELECT DISTINCT lower(trim(skill)) AS skill
  FROM jobs j
  CROSS JOIN LATERAL unnest(j.required_skills) AS skill
  WHERE j.id = p_job_id
),
comparison AS (
  SELECT
    COALESCE(
      ARRAY(
        SELECT js.skill
        FROM job_skill_set js
        JOIN user_skill_set us ON us.skill = js.skill
        ORDER BY js.skill
      ),
      ARRAY[]::TEXT[]
    ) AS matched,
    COALESCE(
      ARRAY(
        SELECT js.skill
        FROM job_skill_set js
        WHERE NOT EXISTS (
          SELECT 1 FROM user_skill_set us WHERE us.skill = js.skill
        )
        ORDER BY js.skill
      ),
      ARRAY[]::TEXT[]
    ) AS missing,
    (SELECT COUNT(*)::NUMERIC FROM job_skill_set) AS total_job_skills
)
SELECT
  p_user_id AS user_id,
  p_job_id AS job_id,
  CASE
    WHEN c.total_job_skills = 0 THEN 0
    ELSE ROUND((CARDINALITY(c.matched)::NUMERIC / c.total_job_skills) * 100, 2)
  END AS ats_score_pct,
  c.matched AS matched_skills,
  c.missing AS missing_skills
FROM comparison c;
$$;
