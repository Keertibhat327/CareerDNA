-- Seed data for CareerDNA AI (PostgreSQL / Supabase)
-- This script inserts realistic Indian sample data for demo and testing.
-- Explicit ID generation is used to avoid dependency on column DEFAULT values.
-- Requires pgcrypto extension for gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Students
INSERT INTO users (id, name, email, password, phone, skills, resume_headline, location, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'Aarav Mehta', 'aarav.mehta@student.careerdna.in', 'Pass@123', '+919910001111', ARRAY['Python','SQL','Pandas','Machine Learning','Scikit-learn','Power BI'], 'Data-driven engineering student focused on AIML', 'Bengaluru', now(), now()),
  (gen_random_uuid()::text, 'Diya Nair', 'diya.nair@student.careerdna.in', 'Pass@123', '+919845551234', ARRAY['Node.js','Express.js','PostgreSQL','Docker','REST API','Git'], 'Backend developer building scalable APIs', 'Kochi', now(), now()),
  (gen_random_uuid()::text, 'Rohan Kulkarni', 'rohan.kulkarni@student.careerdna.in', 'Pass@123', '+919930002222', ARRAY['React','Next.js','TypeScript','Node.js','MongoDB','Tailwind CSS'], 'Full stack enthusiast with product mindset', 'Pune', now(), now()),
  (gen_random_uuid()::text, 'Sneha Iyer', 'sneha.iyer@student.careerdna.in', 'Pass@123', '+919940003333', ARRAY['SQL','Excel','Power BI','Tableau','Python','Statistics'], 'Analyst focused on business storytelling with data', 'Chennai', now(), now()),
  (gen_random_uuid()::text, 'Karthik Reddy', 'karthik.reddy@student.careerdna.in', 'Pass@123', '+919950004444', ARRAY['Java','Spring Boot','MySQL','AWS','Docker','CI/CD'], 'Backend engineer with cloud deployment skills', 'Hyderabad', now(), now());

-- 2) Recruiters
INSERT INTO recruiters (id, name, email, password, company_name, company, designation, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'Neha Sharma', 'neha.sharma@tcs.com', 'Recruit@123', 'Tata Consultancy Services', 'TCS', 'Senior Talent Acquisition Specialist', now(), now()),
  (gen_random_uuid()::text, 'Vikram Deshpande', 'vikram.deshpande@infosys.com', 'Recruit@123', 'Infosys Limited', 'Infosys', 'Technical Recruiter', now(), now()),
  (gen_random_uuid()::text, 'Priya Bansal', 'priya.bansal@zoho.com', 'Recruit@123', 'Zoho Corporation', 'Zoho', 'Hiring Manager - Engineering', now(), now());

-- 3) Jobs
INSERT INTO jobs (id, title, company, description, location, salary, required_skills, recruiter_id, created_at, updated_at)
VALUES
  (
    gen_random_uuid()::text,
    'AIML Engineer Intern',
    'TCS',
    'Build and evaluate machine learning pipelines for recommendation and classification use cases.',
    'Bengaluru',
    900000,
    ARRAY['Python','Machine Learning','SQL','Scikit-learn','Pandas','AWS'],
    (SELECT id FROM recruiters WHERE email = 'neha.sharma@tcs.com'),
    now(),
    now()
  ),
  (
    gen_random_uuid()::text,
    'Backend Developer',
    'Infosys',
    'Develop REST APIs and optimize database-heavy services in a microservice architecture.',
    'Hyderabad',
    800000,
    ARRAY['Node.js','Express.js','PostgreSQL','Docker','Redis','Git'],
    (SELECT id FROM recruiters WHERE email = 'vikram.deshpande@infosys.com'),
    now(),
    now()
  ),
  (
    gen_random_uuid()::text,
    'Full Stack Developer',
    'Zoho',
    'Own frontend and backend modules for customer-facing SaaS features.',
    'Chennai',
    1000000,
    ARRAY['React','Next.js','Node.js','TypeScript','PostgreSQL','Docker'],
    (SELECT id FROM recruiters WHERE email = 'priya.bansal@zoho.com'),
    now(),
    now()
  ),
  (
    gen_random_uuid()::text,
    'Data Analyst',
    'TCS',
    'Create business dashboards and SQL reports for leadership teams.',
    'Mumbai',
    700000,
    ARRAY['SQL','Excel','Power BI','Tableau','Statistics','Python'],
    (SELECT id FROM recruiters WHERE email = 'neha.sharma@tcs.com'),
    now(),
    now()
  ),
  (
    gen_random_uuid()::text,
    'Cloud Backend Engineer',
    'Infosys',
    'Design and deploy cloud-native backend services with observability and CI/CD.',
    'Pune',
    1200000,
    ARRAY['Java','Spring Boot','AWS','Docker','Kubernetes','CI/CD'],
    (SELECT id FROM recruiters WHERE email = 'vikram.deshpande@infosys.com'),
    now(),
    now()
  ),
  (
    gen_random_uuid()::text,
    'Junior Data Engineer',
    'Zoho',
    'Build ETL workflows and maintain analytics-ready datasets.',
    'Coimbatore',
    850000,
    ARRAY['Python','SQL','Airflow','Docker','AWS','Git'],
    (SELECT id FROM recruiters WHERE email = 'priya.bansal@zoho.com'),
    now(),
    now()
  );

-- 4) Applications (mixed statuses)
INSERT INTO applications (id, user_id, job_id, status, applied_at, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'aarav.mehta@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'AIML Engineer Intern'), 'reviewed', now() - interval '10 days', now() - interval '10 days', now() - interval '10 days'),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'aarav.mehta@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'Junior Data Engineer'), 'applied', now() - interval '4 days', now() - interval '4 days', now() - interval '4 days'),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'diya.nair@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'Backend Developer'), 'hired', now() - interval '20 days', now() - interval '20 days', now() - interval '20 days'),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'diya.nair@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'Cloud Backend Engineer'), 'reviewed', now() - interval '6 days', now() - interval '6 days', now() - interval '6 days'),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'rohan.kulkarni@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'Full Stack Developer'), 'applied', now() - interval '3 days', now() - interval '3 days', now() - interval '3 days'),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'sneha.iyer@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'Data Analyst'), 'hired', now() - interval '12 days', now() - interval '12 days', now() - interval '12 days'),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'karthik.reddy@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'Cloud Backend Engineer'), 'rejected', now() - interval '8 days', now() - interval '8 days', now() - interval '8 days'),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'karthik.reddy@student.careerdna.in'), (SELECT id FROM jobs WHERE title = 'Backend Developer'), 'reviewed', now() - interval '5 days', now() - interval '5 days', now() - interval '5 days');

-- 5) Skill weights (15+ realistic skills)
INSERT INTO skill_weights (id, skill_name, aiml_weight, backend_weight, analyst_weight, fullstack_weight, data_analyst_weight)
VALUES
  (gen_random_uuid()::text, 'Python', 0.95, 0.45, 0.70, 0.40, 0.85),
  (gen_random_uuid()::text, 'SQL', 0.70, 0.80, 0.95, 0.65, 0.95),
  (gen_random_uuid()::text, 'Machine Learning', 1.00, 0.10, 0.35, 0.10, 0.45),
  (gen_random_uuid()::text, 'Scikit-learn', 0.90, 0.05, 0.20, 0.05, 0.30),
  (gen_random_uuid()::text, 'Pandas', 0.85, 0.20, 0.75, 0.20, 0.90),
  (gen_random_uuid()::text, 'Power BI', 0.20, 0.10, 0.95, 0.10, 0.95),
  (gen_random_uuid()::text, 'Tableau', 0.20, 0.10, 0.90, 0.10, 0.90),
  (gen_random_uuid()::text, 'Statistics', 0.70, 0.20, 0.95, 0.10, 0.95),
  (gen_random_uuid()::text, 'Node.js', 0.15, 0.95, 0.10, 0.85, 0.10),
  (gen_random_uuid()::text, 'Express.js', 0.10, 0.95, 0.05, 0.75, 0.05),
  (gen_random_uuid()::text, 'PostgreSQL', 0.30, 0.90, 0.65, 0.75, 0.60),
  (gen_random_uuid()::text, 'React', 0.10, 0.20, 0.05, 1.00, 0.05),
  (gen_random_uuid()::text, 'Next.js', 0.10, 0.20, 0.05, 0.95, 0.05),
  (gen_random_uuid()::text, 'TypeScript', 0.15, 0.65, 0.10, 0.90, 0.10),
  (gen_random_uuid()::text, 'Docker', 0.35, 0.85, 0.15, 0.70, 0.20),
  (gen_random_uuid()::text, 'AWS', 0.55, 0.85, 0.20, 0.65, 0.25),
  (gen_random_uuid()::text, 'Kubernetes', 0.25, 0.80, 0.05, 0.50, 0.05),
  (gen_random_uuid()::text, 'Java', 0.10, 0.85, 0.05, 0.45, 0.05),
  (gen_random_uuid()::text, 'Spring Boot', 0.05, 0.90, 0.05, 0.40, 0.05),
  (gen_random_uuid()::text, 'Git', 0.20, 0.70, 0.20, 0.75, 0.20),
  (gen_random_uuid()::text, 'CI/CD', 0.15, 0.80, 0.10, 0.60, 0.10),
  (gen_random_uuid()::text, 'Airflow', 0.60, 0.20, 0.55, 0.15, 0.70),
  (gen_random_uuid()::text, 'Redis', 0.10, 0.75, 0.05, 0.40, 0.05);

-- 6) Optional initial career score snapshots (derived-like seed values for dashboard)
INSERT INTO career_scores (id, user_id, aiml_fit, backend_fit, analyst_fit, fullstack_fit, data_analyst_fit, calculated_at)
VALUES
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'aarav.mehta@student.careerdna.in'), 86.0, 48.0, 76.0, 44.0, 82.0, now()),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'diya.nair@student.careerdna.in'), 34.0, 88.0, 32.0, 70.0, 35.0, now()),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'rohan.kulkarni@student.careerdna.in'), 30.0, 66.0, 28.0, 90.0, 33.0, now()),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'sneha.iyer@student.careerdna.in'), 52.0, 36.0, 91.0, 30.0, 94.0, now()),
  (gen_random_uuid()::text, (SELECT id FROM users WHERE email = 'karthik.reddy@student.careerdna.in'), 32.0, 84.0, 30.0, 58.0, 34.0, now());
