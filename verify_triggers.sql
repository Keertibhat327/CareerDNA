-- Trigger verification script for CareerDNA AI
-- Purpose: Quickly validate that all trigger automations work as expected.
-- Compatible with PostgreSQL / Supabase SQL editor.
--
-- What this script verifies:
-- 1) INSERT into applications increments job_application_stats.total_applications
-- 2) UPDATE users.skills recalculates/updates career_scores for that user
-- 3) UPDATE applications.status inserts audit row into application_status_logs
--
-- Notes:
-- - This script uses one temporary test application row and deletes it at the end.
-- - Existing seeded users/jobs are required (seed.sql should be run first).

BEGIN;

-- Ensure UUID generator is available for explicit TEXT ids.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 0) Pick one existing user and job for deterministic verification
-- ----------------------------------------------------------------------------
WITH picked AS (
  SELECT
    (SELECT id FROM users ORDER BY created_at ASC LIMIT 1) AS user_id,
    (SELECT id FROM jobs ORDER BY created_at ASC LIMIT 1) AS job_id
)
SELECT * FROM picked;

-- ----------------------------------------------------------------------------
-- 1) Verify trigger: applications INSERT -> job_application_stats increment
-- ----------------------------------------------------------------------------
-- Read current count for target job.
WITH picked AS (
  SELECT (SELECT id FROM jobs ORDER BY created_at ASC LIMIT 1) AS job_id
)
SELECT
  p.job_id,
  COALESCE(s.total_applications, 0) AS before_total_applications
FROM picked p
LEFT JOIN job_application_stats s ON s.job_id = p.job_id;

-- Insert one test application (status: applied).
WITH picked AS (
  SELECT
    (SELECT id FROM users ORDER BY created_at ASC LIMIT 1) AS user_id,
    (SELECT id FROM jobs ORDER BY created_at ASC LIMIT 1) AS job_id
)
INSERT INTO applications (id, user_id, job_id, status, applied_at, created_at, updated_at)
SELECT gen_random_uuid()::text, user_id, job_id, 'applied', now(), now(), now()
FROM picked
RETURNING id AS inserted_application_id, user_id, job_id, status, applied_at;

-- Confirm count incremented by +1.
WITH picked AS (
  SELECT (SELECT id FROM jobs ORDER BY created_at ASC LIMIT 1) AS job_id
)
SELECT
  p.job_id,
  s.total_applications AS after_total_applications,
  s.updated_at
FROM picked p
JOIN job_application_stats s ON s.job_id = p.job_id;

-- ----------------------------------------------------------------------------
-- 2) Verify trigger: users.skills UPDATE -> career_scores recalculated
-- ----------------------------------------------------------------------------
-- Show latest score snapshot before skill change.
WITH picked AS (
  SELECT (SELECT id FROM users ORDER BY created_at ASC LIMIT 1) AS user_id
)
SELECT
  cs.user_id,
  cs.aiml_fit,
  cs.backend_fit,
  cs.analyst_fit,
  cs.fullstack_fit,
  cs.data_analyst_fit,
  cs.calculated_at
FROM career_scores cs
JOIN picked p ON p.user_id = cs.user_id
ORDER BY cs.calculated_at DESC
LIMIT 1;

-- Update the same user with a deterministic skill set.
-- This should trigger a recalculation in career_scores.
WITH picked AS (
  SELECT (SELECT id FROM users ORDER BY created_at ASC LIMIT 1) AS user_id
)
UPDATE users u
SET skills = ARRAY['Python','SQL','Machine Learning','Docker','AWS']
FROM picked p
WHERE u.id = p.user_id
RETURNING u.id AS updated_user_id, u.skills;

-- Show latest score snapshot after skill change.
WITH picked AS (
  SELECT (SELECT id FROM users ORDER BY created_at ASC LIMIT 1) AS user_id
)
SELECT
  cs.user_id,
  cs.aiml_fit,
  cs.backend_fit,
  cs.analyst_fit,
  cs.fullstack_fit,
  cs.data_analyst_fit,
  cs.calculated_at
FROM career_scores cs
JOIN picked p ON p.user_id = cs.user_id
ORDER BY cs.calculated_at DESC
LIMIT 1;

-- ----------------------------------------------------------------------------
-- 3) Verify trigger: applications status UPDATE -> audit log row inserted
-- ----------------------------------------------------------------------------
-- Fetch newest application (the one inserted above), then update status.
WITH latest_app AS (
  SELECT id
  FROM applications
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE applications a
SET status = 'reviewed'
FROM latest_app la
WHERE a.id = la.id
RETURNING a.id AS updated_application_id, a.status;

-- Confirm status audit log exists for latest application.
WITH latest_app AS (
  SELECT id
  FROM applications
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  l.id AS log_id,
  l.application_id,
  l.old_status,
  l.new_status,
  l.changed_at
FROM application_status_logs l
JOIN latest_app la ON la.id = l.application_id
ORDER BY l.changed_at DESC
LIMIT 5;

-- ----------------------------------------------------------------------------
-- 4) Cleanup test insert so verification can be rerun safely
-- ----------------------------------------------------------------------------
-- Delete the test application created in this session (latest one by created_at).
-- Counter table will not auto-decrement because only INSERT trigger exists by design.
-- If strict count parity is required in test environments, update it manually below.
WITH latest_app AS (
  SELECT id, job_id
  FROM applications
  ORDER BY created_at DESC
  LIMIT 1
),
deleted AS (
  DELETE FROM applications a
  USING latest_app la
  WHERE a.id = la.id
  RETURNING la.job_id
)
UPDATE job_application_stats s
SET total_applications = GREATEST(s.total_applications - 1, 0),
    updated_at = now()
FROM deleted d
WHERE s.job_id = d.job_id;

COMMIT;
