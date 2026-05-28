-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "skills" TEXT[],
    "resume_headline" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiters" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "company_name" TEXT NOT NULL,
    "company" TEXT,
    "designation" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "salary" INTEGER,
    "required_skills" TEXT[],
    "recruiter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "aiml_fit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "backend_fit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "analyst_fit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fullstack_fit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data_analyst_fit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_weights" (
    "id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "aiml_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "backend_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "analyst_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fullstack_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data_analyst_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "skill_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "recruiters_email_key" ON "recruiters"("email");

-- CreateIndex
CREATE INDEX "career_scores_user_id_idx" ON "career_scores"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_weights_skill_name_key" ON "skill_weights"("skill_name");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "recruiters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_scores" ADD CONSTRAINT "career_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
