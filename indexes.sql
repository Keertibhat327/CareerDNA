-- Performance indexes for common lookup and join paths.
-- Note: users.email already has a UNIQUE constraint in Prisma; this keeps an explicit index script deliverable.

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
  ON users (email);

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id
  ON jobs (recruiter_id);

CREATE INDEX IF NOT EXISTS idx_applications_user_id
  ON applications (user_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
  ON applications (job_id);

CREATE INDEX IF NOT EXISTS idx_skill_weights_skill_name
  ON skill_weights (skill_name);
