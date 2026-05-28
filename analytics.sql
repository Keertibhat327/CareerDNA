-- Analytics queries for CareerDNA dashboards.

-- 1) Total applications per job (recruiter dashboard)
SELECT
  j.id AS job_id,
  j.title,
  j.company,
  COUNT(a.id) AS total_applications
FROM jobs j
LEFT JOIN applications a ON a.job_id = j.id
GROUP BY j.id, j.title, j.company
ORDER BY total_applications DESC, j.title;

-- 2) Most common skills across all users
SELECT
  lower(trim(skill)) AS skill_name,
  COUNT(*) AS frequency
FROM users u
CROSS JOIN LATERAL unnest(u.skills) AS skill
GROUP BY lower(trim(skill))
ORDER BY frequency DESC, skill_name
LIMIT 20;

-- 3) Average career fit scores across all users
SELECT
  ROUND(AVG(cs.aiml_fit)::numeric, 2) AS avg_aiml_fit,
  ROUND(AVG(cs.backend_fit)::numeric, 2) AS avg_backend_fit,
  ROUND(AVG(cs.analyst_fit)::numeric, 2) AS avg_analyst_fit,
  ROUND(AVG(cs.fullstack_fit)::numeric, 2) AS avg_fullstack_fit,
  ROUND(AVG(cs.data_analyst_fit)::numeric, 2) AS avg_data_analyst_fit
FROM career_scores cs;

-- 4) Application status breakdown
SELECT
  a.status,
  COUNT(*) AS total
FROM applications a
GROUP BY a.status
ORDER BY total DESC, a.status;

-- 5) Top 5 jobs by applicant count
SELECT
  j.id AS job_id,
  j.title,
  j.company,
  COUNT(a.id) AS applicant_count
FROM jobs j
LEFT JOIN applications a ON a.job_id = j.id
GROUP BY j.id, j.title, j.company
ORDER BY applicant_count DESC, j.title
LIMIT 5;

-- 6) Students with highest career fit scores (best-fit role + score)
SELECT
  u.id AS user_id,
  u.name,
  GREATEST(cs.aiml_fit, cs.backend_fit, cs.analyst_fit, cs.fullstack_fit, cs.data_analyst_fit) AS top_fit_score,
  CASE
    WHEN cs.aiml_fit = GREATEST(cs.aiml_fit, cs.backend_fit, cs.analyst_fit, cs.fullstack_fit, cs.data_analyst_fit) THEN 'AIML Engineer'
    WHEN cs.backend_fit = GREATEST(cs.aiml_fit, cs.backend_fit, cs.analyst_fit, cs.fullstack_fit, cs.data_analyst_fit) THEN 'Backend Developer'
    WHEN cs.analyst_fit = GREATEST(cs.aiml_fit, cs.backend_fit, cs.analyst_fit, cs.fullstack_fit, cs.data_analyst_fit) THEN 'Analyst'
    WHEN cs.fullstack_fit = GREATEST(cs.aiml_fit, cs.backend_fit, cs.analyst_fit, cs.fullstack_fit, cs.data_analyst_fit) THEN 'Full Stack Developer'
    ELSE 'Data Analyst'
  END AS best_fit_path
FROM career_scores cs
JOIN users u ON u.id = cs.user_id
ORDER BY top_fit_score DESC, u.name
LIMIT 10;
