-- Triggers for CareerDNA AI (PostgreSQL / Supabase compatible)
-- This file adds:
-- 1) Application counter maintenance on new applications
-- 2) Automatic career score recalculation when user skills change
-- 3) Application status change audit logging

-- ============================================================================
-- 1) Maintain total application count (per job) on INSERT into applications
-- ============================================================================
-- Helper table stores rolling application counts per job for fast dashboard reads.
CREATE TABLE IF NOT EXISTS job_application_stats (
  job_id TEXT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
  total_applications INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION fn_increment_job_application_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO job_application_stats (job_id, total_applications, updated_at)
  VALUES (NEW.job_id, 1, now())
  ON CONFLICT (job_id)
  DO UPDATE SET
    total_applications = job_application_stats.total_applications + 1,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_applications_insert_count ON applications;
CREATE TRIGGER trg_applications_insert_count
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION fn_increment_job_application_count();

-- ============================================================================
-- 2) Recalculate career_scores when users.skills is updated
-- ============================================================================
-- Recomputes weighted percentages from skill_weights and upserts into career_scores.
CREATE OR REPLACE FUNCTION fn_recalculate_career_scores_on_skill_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_aiml_sum NUMERIC := 0;
  v_backend_sum NUMERIC := 0;
  v_analyst_sum NUMERIC := 0;
  v_fullstack_sum NUMERIC := 0;
  v_data_analyst_sum NUMERIC := 0;
  v_aiml_total NUMERIC := 0;
  v_backend_total NUMERIC := 0;
  v_analyst_total NUMERIC := 0;
  v_fullstack_total NUMERIC := 0;
  v_data_analyst_total NUMERIC := 0;
BEGIN
  -- Only run when the skills array actually changes.
  IF COALESCE(OLD.skills, ARRAY[]::TEXT[]) IS NOT DISTINCT FROM COALESCE(NEW.skills, ARRAY[]::TEXT[]) THEN
    RETURN NEW;
  END IF;

  -- Sum weights for skills present in the updated profile.
  SELECT
    COALESCE(SUM(sw.aiml_weight), 0),
    COALESCE(SUM(sw.backend_weight), 0),
    COALESCE(SUM(sw.analyst_weight), 0),
    COALESCE(SUM(sw.fullstack_weight), 0),
    COALESCE(SUM(sw.data_analyst_weight), 0)
  INTO
    v_aiml_sum,
    v_backend_sum,
    v_analyst_sum,
    v_fullstack_sum,
    v_data_analyst_sum
  FROM skill_weights sw
  WHERE lower(sw.skill_name) IN (
    SELECT DISTINCT lower(trim(skill))
    FROM unnest(COALESCE(NEW.skills, ARRAY[]::TEXT[])) AS skill
  );

  -- Denominator: total available weights across all skills.
  SELECT
    COALESCE(SUM(sw.aiml_weight), 0),
    COALESCE(SUM(sw.backend_weight), 0),
    COALESCE(SUM(sw.analyst_weight), 0),
    COALESCE(SUM(sw.fullstack_weight), 0),
    COALESCE(SUM(sw.data_analyst_weight), 0)
  INTO
    v_aiml_total,
    v_backend_total,
    v_analyst_total,
    v_fullstack_total,
    v_data_analyst_total
  FROM skill_weights sw;

  -- Update latest row for this user if present; otherwise insert one snapshot row.
  UPDATE career_scores
  SET
    aiml_fit = CASE WHEN v_aiml_total = 0 THEN 0 ELSE ROUND((v_aiml_sum / v_aiml_total) * 100, 2) END,
    backend_fit = CASE WHEN v_backend_total = 0 THEN 0 ELSE ROUND((v_backend_sum / v_backend_total) * 100, 2) END,
    analyst_fit = CASE WHEN v_analyst_total = 0 THEN 0 ELSE ROUND((v_analyst_sum / v_analyst_total) * 100, 2) END,
    fullstack_fit = CASE WHEN v_fullstack_total = 0 THEN 0 ELSE ROUND((v_fullstack_sum / v_fullstack_total) * 100, 2) END,
    data_analyst_fit = CASE WHEN v_data_analyst_total = 0 THEN 0 ELSE ROUND((v_data_analyst_sum / v_data_analyst_total) * 100, 2) END,
    calculated_at = now()
  WHERE id = (
    SELECT id
    FROM career_scores
    WHERE user_id = NEW.id
    ORDER BY calculated_at DESC
    LIMIT 1
  );

  IF NOT FOUND THEN
    INSERT INTO career_scores (
      user_id,
      aiml_fit,
      backend_fit,
      analyst_fit,
      fullstack_fit,
      data_analyst_fit,
      calculated_at
    )
    VALUES (
      NEW.id,
      CASE WHEN v_aiml_total = 0 THEN 0 ELSE ROUND((v_aiml_sum / v_aiml_total) * 100, 2) END,
      CASE WHEN v_backend_total = 0 THEN 0 ELSE ROUND((v_backend_sum / v_backend_total) * 100, 2) END,
      CASE WHEN v_analyst_total = 0 THEN 0 ELSE ROUND((v_analyst_sum / v_analyst_total) * 100, 2) END,
      CASE WHEN v_fullstack_total = 0 THEN 0 ELSE ROUND((v_fullstack_sum / v_fullstack_total) * 100, 2) END,
      CASE WHEN v_data_analyst_total = 0 THEN 0 ELSE ROUND((v_data_analyst_sum / v_data_analyst_total) * 100, 2) END,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_skills_recalculate_scores ON users;
CREATE TRIGGER trg_users_skills_recalculate_scores
AFTER UPDATE OF skills ON users
FOR EACH ROW
EXECUTE FUNCTION fn_recalculate_career_scores_on_skill_update();

-- ============================================================================
-- 3) Log application status changes with timestamp
-- ============================================================================
-- Audit table captures every status transition for traceability and analytics.
CREATE TABLE IF NOT EXISTS application_status_logs (
  id BIGSERIAL PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION fn_log_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only log real transitions.
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO application_status_logs (
      application_id,
      user_id,
      job_id,
      old_status,
      new_status,
      changed_at
    )
    VALUES (
      NEW.id,
      NEW.user_id,
      NEW.job_id,
      OLD.status,
      NEW.status,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_applications_status_audit ON applications;
CREATE TRIGGER trg_applications_status_audit
AFTER UPDATE OF status ON applications
FOR EACH ROW
EXECUTE FUNCTION fn_log_application_status_change();
