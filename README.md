# CareerDNA AI — Smart Job Portal Backend

This is the backend API for **CareerDNA AI — Smart Job Portal with Career Intelligence**, built with **Node.js, Express, Prisma ORM, PostgreSQL**, and **JWT Authentication**. It serves as a 1-day MVP focused on simplicity, clean design, and high demo value.

---

## Database Setup Guide (Supabase + Prisma)

This section is the execution playbook for the database layer files:
- `prisma/schema.prisma`
- `seed.sql`
- `career_score.sql`
- `ats_score.sql`
- `triggers.sql`
- `verify_triggers.sql`
- `analytics.sql`
- `indexes.sql`

### 1. Create a Supabase project
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Choose a project name (e.g. `careerdna-ai`) and set a strong database password.
3. Wait until the project is fully provisioned.

### 2. Get the PostgreSQL connection string
1. In Supabase dashboard: `Project Settings` -> `Database`.
2. Copy the connection string in this format:
   `postgresql://postgres:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?schema=public`
3. Add it to backend `.env` as:
   `DATABASE_URL="postgresql://postgres:<YOUR_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?schema=public"`

### 3. Push Prisma schema to Supabase
From project root, run:
```bash
npx prisma generate
npx prisma db push
```
This creates/updates tables from `prisma/schema.prisma`:
- `users`
- `recruiters`
- `jobs`
- `applications`
- `career_scores`
- `skill_weights`

### 4. Run SQL files in this exact order
Use Supabase SQL Editor and execute file-by-file:
1. `seed.sql` (inserts sample records)
2. `career_score.sql` (creates career score function)
3. `ats_score.sql` (creates ATS score function)
4. `triggers.sql` (automations for counters, score updates, and status audit logs)
5. `indexes.sql` (adds performance indexes)
6. `analytics.sql` (saved query set for dashboard/BI usage)
7. `verify_triggers.sql` (end-to-end trigger validation)

### 5. What to share with backend team
Share only:
- `DATABASE_URL` (service connection string in `.env`)
- Supabase project reference (optional, for dashboard access)

Do **not** share:
- your Supabase account password
- JWT secrets or private API keys in public channels

### 6. Quick verification queries
Run after setup:
```sql
SELECT COUNT(*) AS users_count FROM users;
SELECT COUNT(*) AS jobs_count FROM jobs;
SELECT * FROM calculate_career_score((SELECT id FROM users LIMIT 1));
SELECT * FROM calculate_ats_score((SELECT id FROM users LIMIT 1), (SELECT id FROM jobs LIMIT 1));
```

---

## Technical Stack

- **Runtime**: Node.js (with ES Modules support)
- **Framework**: Express.js
- **Database ORM**: Prisma ORM
- **Authentication**: JSON Web Tokens (JWT) + `bcryptjs` for password security
- **Validation**: Role-based access control (RBAC) middleware for `student` and `recruiter` roles.

---

## Directory Structure

```text
CareerDNA/
├── prisma/
│   ├── schema.prisma   # Prisma database schema definition
│   └── seed.js         # DB seed file for instant demo setup
├── src/
│   ├── config/
│   │   └── db.js       # Reusable Prisma client configuration
│   ├── controllers/
│   │   ├── authController.js   # Sign-up and login logic
│   │   ├── jobController.js    # Job postings and applications
│   │   ├── scoreController.js  # Career DNA profile scoring (weighted logic)
│   │   └── atsController.js    # ATS Resume Analyzer (matching algorithm)
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT authentication & optional parser
│   │   └── roleMiddleware.js   # Role enforcement (student / recruiter)
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoint registrations
│   │   ├── jobRoutes.js        # Jobs & application endpoints
│   │   ├── scoreRoutes.js      # Career scoring endpoint
│   │   └── atsRoutes.js        # ATS analyzer endpoint
│   ├── utils/
│   │   ├── hash.js             # Bcrypt hashing helper
│   │   └── jwt.js              # Token generation and verification
│   └── index.js        # Server entry point
├── scratch/
│   └── verify.js       # Database-less backend unit test script
├── .env                # Local configuration environment file
├── .env.example        # Environment template reference
└── package.json        # Project metadata and dependency configuration
```

---

## Setup & Running Guide

### 1. Installation
Clone/navigate to the folder and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`) and supply your PostgreSQL connection string:
```env
PORT=5000
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database_name>?schema=public"
JWT_SECRET="your-jwt-signing-secret"
JWT_EXPIRES_IN="24h"
```

### 3. Initialize Database & Run Migrations
Run Prisma migrations to initialize database tables:
```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database
Populate the database with pre-configured mock data (recruiters, students, jobs, applications):
```bash
npm run prisma:seed
```

### 5. Start the Server
Start the development server with live reload:
```bash
npm run dev
```
Or start in production mode:
```bash
npm start
```

---

## Testing Logic Without Database
A dedicated mock testing file is included for quick logic validation without setting up PostgreSQL:
```bash
node scratch/verify.js
```

---

## API Documentation

### 1. Authentication

#### **POST** `/auth/signup`
Creates a new account. Fits both roles.
- **Body Payload (Student)**:
  ```json
  {
    "email": "student@careerdna.com",
    "password": "student123",
    "role": "student",
    "name": "Diya Shetty",
    "skills": "Python, SQL, Node.js, JavaScript"
  }
  ```
- **Body Payload (Recruiter)**:
  ```json
  {
    "email": "recruiter@techcorp.com",
    "password": "recruiter123",
    "role": "recruiter",
    "companyName": "TechCorp Solutions"
  }
  ```

#### **POST** `/auth/login`
Authenticates a user and issues a bearer token.
- **Body Payload**:
  ```json
  {
    "email": "student@careerdna.com",
    "password": "student123",
    "role": "student"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOi...",
    "user": { "id": "uuid", "name": "...", "role": "student", "skills": [...] }
  }
  ```

---

### 2. Job Portal Core

#### **POST** `/jobs` (Recruiter Only)
Post a job. Requires Bearer Token.
- **Body Payload**:
  ```json
  {
    "title": "Backend Engineer",
    "description": "Develop high-scale Node.js APIs.",
    "requiredSkills": ["Node.js", "Express.js", "SQL", "PostgreSQL", "JavaScript"]
  }
  ```

#### **GET** `/jobs` (Public)
Retrieve a list of all jobs including recruiter company names.

#### **POST** `/apply` (Student Only)
Apply for a job. Requires Bearer Token.
- **Body Payload**:
  ```json
  {
    "jobId": "job-uuid"
  }
  ```

---

### 3. Career DNA Scoring (Weighted Logic)

#### **POST** `/career-score` (Public or Authenticated)
Calculates compatibility against core roles based on pre-defined skills.
- **If Authenticated**: Automatically uses the logged-in student's saved skills if no skills are passed.
- **Body Payload (Optional/Public)**:
  ```json
  {
    "skills": "Python, SQL, TensorFlow, PyTorch"
  }
  ```
- **Response**:
  ```json
  {
    "inputSkills": "Python, SQL, TensorFlow, PyTorch",
    "normalizedSkills": ["python", "sql", "tensorflow", "pytorch"],
    "careerDNAScores": {
      "AIML Engineer": "50%",
      "Backend Developer": "14%",
      "Data Analyst": "31%"
    }
  }
  ```

---

### 4. ATS Resume Analyzer (Simplified Match)

#### **POST** `/ats-score` (Public or Authenticated)
Compares resume skills to a job's requirements, reporting the match percentage and missing skills.
- **If Authenticated + `jobId` provided**: Automatically compares the student's database skills to that specific job's requirement.
- **Body Payload (Public)**:
  ```json
  {
    "userSkills": ["Python", "SQL", "Node.js"],
    "jobRequiredSkills": ["Python", "SQL", "Machine Learning", "Tensorflow"]
  }
  ```
- **Response**:
  ```json
  {
    "atsScore": "50%",
    "matchingSkills": ["Python", "SQL"],
    "missingSkills": ["Machine Learning", "Tensorflow"]
  }
  ```
