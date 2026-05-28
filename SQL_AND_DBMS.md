# CareerDNA AI — SQL & DBMS Concepts

## Overview

The Intelligence Module heavily uses DBMS concepts and SQL queries (via Prisma ORM).
This document highlights the database design and query patterns used.

---

## Database Schema

### Core Tables

```sql
-- Users table (candidates)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(20),
  skills TEXT[],              -- Array of skill names
  resume_headline TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table (postings by recruiters)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  company VARCHAR(255),
  description TEXT,
  location VARCHAR(255),
  salary INTEGER,             -- In INR
  required_skills TEXT[],     -- Array of skill names
  recruiter_id UUID FOREIGN KEY REFERENCES recruiters(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Applications table (linking users to jobs)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID FOREIGN KEY REFERENCES jobs(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'applied',  -- applied, reviewed, rejected, hired
  applied_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Career scores table (denormalized for performance)
CREATE TABLE career_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
  aiml_fit FLOAT DEFAULT 0,
  backend_fit FLOAT DEFAULT 0,
  analyst_fit FLOAT DEFAULT 0,
  fullstack_fit FLOAT DEFAULT 0,
  data_analyst_fit FLOAT DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_jobs_id ON jobs(id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_career_scores_user_id ON career_scores(user_id);
```

---

## Prisma Schema

```prisma
model User {
  id              String        @id @default(uuid())
  name            String
  email           String        @unique
  password        String
  phone           String?
  skills          String[]      // Array of skill names
  resumeHeadline  String?       @map("resume_headline")
  location        String?
  applications    Application[]
  careerScores    CareerScore[]
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  @@map("users")
}

model Job {
  id              String        @id @default(uuid())
  title           String
  company         String?
  description     String
  location        String?
  salary          Int?
  requiredSkills  String[]      @map("required_skills")
  recruiterId     String        @map("recruiter_id")
  recruiter       Recruiter     @relation(fields: [recruiterId], references: [id], onDelete: Cascade)
  applications    Application[]
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  @@map("jobs")
}

model Application {
  id              String        @id @default(uuid())
  userId          String        @map("user_id")
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobId           String        @map("job_id")
  job             Job           @relation(fields: [jobId], references: [id], onDelete: Cascade)
  status          String        @default("applied")
  appliedAt       DateTime      @default(now()) @map("applied_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  @@map("applications")
}

model CareerScore {
  id              String        @id @default(uuid())
  userId          String        @unique @map("user_id")
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  aimlFit         Float         @default(0) @map("aiml_fit")
  backendFit      Float         @default(0) @map("backend_fit")
  analystFit      Float         @default(0) @map("analyst_fit")
  calculatedAt    DateTime      @default(now()) @map("calculated_at")

  @@index([userId])
  @@map("career_scores")
}
```

---

## Prisma Queries Used in Intelligence Module

### 1. Career DNA Score Engine

```javascript
// Fetch user with skills
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { skills: true }
});
```

**DBMS Concepts:**
- Direct primary key lookup (O(1) complexity)
- Column selection (projection)
- Reduces data transfer

---

### 2. ATS Score Calculation

```javascript
// Fetch both user and job
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { skills: true }
});

const job = await prisma.job.findUnique({
  where: { id: jobId },
  select: { requiredSkills: true }
});
```

**DBMS Concepts:**
- Two independent lookups
- Can be parallelized in production
- Efficient column filtering

---

### 3. Skill Recommendations

```javascript
// Complex join query
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { 
    skills: true,
    applications: {
      include: {
        job: {
          select: { requiredSkills: true }
        }
      }
    }
  }
});

// Equivalent SQL would be:
// SELECT u.skills, j.required_skills
// FROM users u
// LEFT JOIN applications a ON u.id = a.user_id
// LEFT JOIN jobs j ON a.job_id = j.id
// WHERE u.id = ?
```

**DBMS Concepts:**
- Multi-level joins
- Related data inclusion
- Nested selection

---

### 4. Analytics Queries

#### Get All Users (for ranking)
```javascript
const allUsers = await prisma.user.findMany({
  select: { id: true, name: true, email: true, skills: true }
});

// Equivalent SQL:
// SELECT id, name, email, skills FROM users;
```

**DBMS Concepts:**
- Full table scan
- All rows retrieval
- No WHERE clause

#### Get All Applications with Relationships
```javascript
const applications = await prisma.application.findMany({
  include: {
    user: { select: { skills: true } },
    job: { select: { requiredSkills: true } }
  }
});

// Equivalent SQL:
// SELECT a.*, u.skills, j.required_skills
// FROM applications a
// LEFT JOIN users u ON a.user_id = u.id
// LEFT JOIN jobs j ON a.job_id = j.id;
```

**DBMS Concepts:**
- Two-level joins
- Data aggregation
- Complex relational queries

---

## Advanced SQL Patterns (if using raw SQL)

### 1. Aggregate Skills Count

```sql
-- Count occurrences of each skill
SELECT 
  skill,
  COUNT(*) as count
FROM (
  SELECT UNNEST(skills) as skill
  FROM users
)
GROUP BY skill
ORDER BY count DESC
LIMIT 10;
```

**DBMS Concepts:**
- UNNEST (explode array)
- GROUP BY aggregation
- ORDER BY + LIMIT ranking

---

### 2. Skill Match Percentage

```sql
-- Calculate ATS score for a specific application
SELECT 
  a.id,
  a.user_id,
  a.job_id,
  ROUND(
    CAST(
      array_length(
        array(
          SELECT UNNEST(u.skills) 
          INTERSECT 
          SELECT UNNEST(j.required_skills)
        ), 
        1
      ) AS FLOAT
    ) / array_length(j.required_skills, 1) * 100, 2
  ) as ats_score
FROM applications a
JOIN users u ON a.user_id = u.id
JOIN jobs j ON a.job_id = j.id
WHERE a.user_id = ? AND a.job_id = ?;
```

**DBMS Concepts:**
- Array operations (UNNEST, INTERSECT)
- CAST type conversion
- Function composition
- ROUND rounding

---

### 3. Skill Gap Analysis

```sql
-- Find skills needed but user doesn't have
SELECT 
  u.id,
  u.email,
  ARRAY_AGG(DISTINCT skill) as missing_skills
FROM (
  SELECT 
    u.id,
    u.email,
    UNNEST(j.required_skills) as skill
  FROM users u
  CROSS JOIN jobs j
  WHERE UNNEST(u.skills) != UNNEST(j.required_skills)
) subquery
GROUP BY u.id, u.email
LIMIT 1;
```

**DBMS Concepts:**
- CROSS JOIN
- SET operations
- ARRAY_AGG aggregation
- Subqueries

---

### 4. Candidate Ranking

```sql
-- Rank candidates by skills matching a job
SELECT 
  u.id,
  u.name,
  u.email,
  array_length(
    array(
      SELECT UNNEST(u.skills) 
      INTERSECT 
      SELECT UNNEST(j.required_skills)
    ), 
    1
  )::INT as matching_skills_count,
  ROUND(
    CAST(
      array_length(
        array(
          SELECT UNNEST(u.skills) 
          INTERSECT 
          SELECT UNNEST(j.required_skills)
        ), 
        1
      ) AS FLOAT
    ) / array_length(j.required_skills, 1) * 100, 2
  ) as match_percentage
FROM users u
CROSS JOIN jobs j
WHERE j.id = ?
ORDER BY match_percentage DESC
LIMIT 10;
```

**DBMS Concepts:**
- CROSS JOIN matching
- Set intersection
- Ranking/sorting
- Type casting

---

### 5. Application Trends

```sql
-- Applications by day of week
SELECT 
  TO_CHAR(created_at, 'Day') as day_name,
  EXTRACT(DOW FROM created_at) as day_number,
  COUNT(*) as application_count
FROM applications
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY day_name, day_number
ORDER BY day_number;
```

**DBMS Concepts:**
- Date/time functions
- GROUP BY aggregation
- Window functions ready
- Interval calculations

---

### 6. Top Skills with Trend

```sql
-- Skills ranked by frequency with trend
WITH skill_counts AS (
  SELECT 
    skill,
    COUNT(*) as total_count,
    SUM(CASE 
      WHEN created_at >= NOW() - INTERVAL '7 days' 
      THEN 1 ELSE 0 
    END) as last_week_count
  FROM (
    SELECT 
      UNNEST(skills) as skill,
      created_at
    FROM users
  )
  GROUP BY skill
)
SELECT 
  skill,
  total_count,
  last_week_count,
  ROUND(
    CAST(last_week_count AS FLOAT) / total_count * 100, 2
  ) as week_percentage
FROM skill_counts
ORDER BY total_count DESC
LIMIT 10;
```

**DBMS Concepts:**
- Common Table Expressions (CTE/WITH)
- CASE aggregation
- Time-based filtering
- Window-like calculations

---

## Normalization & Relational Design

### Why This Schema Works

1. **First Normal Form (1NF)**
   - Atomic values in most columns
   - skills stored as arrays (acceptable in modern DBMS)
   - No repeating groups

2. **Second Normal Form (2NF)**
   - All non-key attributes depend on entire primary key
   - No partial dependencies

3. **Third Normal Form (3NF)**
   - No transitive dependencies
   - Foreign keys properly reference primary keys
   - No derived data stored

### Foreign Key Relationships

```
User ──────(1:N)────────> Application ──────(N:1)────────> Job
                                                             │
                                                             └─ Recruiter
```

**Benefits:**
- Referential integrity
- CASCADE deletes
- Data consistency
- Query optimization

---

## Query Performance Optimization

### Indexes

```sql
-- Already defined in schema
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_jobs_id ON jobs(id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
```

### Query Plans

1. **Primary key lookups** — O(1) with B-tree index
2. **Foreign key joins** — O(log n) with indexes
3. **Full table scans** — O(n) for analytics
4. **Array operations** — O(n) per row

---

## DBMS Features Demonstrated

✅ **Relational Schema** — Normalized design with proper relationships
✅ **Foreign Keys** — Referential integrity constraints
✅ **Joins** — Single, multiple, and nested joins
✅ **Aggregate Functions** — COUNT, SUM, ARRAY_AGG
✅ **Filtering** — WHERE clauses, set operations
✅ **Sorting** — ORDER BY rankings
✅ **Grouping** — GROUP BY analysis
✅ **Array Operations** — UNNEST, INTERSECT
✅ **Date/Time** — Temporal queries
✅ **Subqueries** — Nested queries
✅ **CTEs** — WITH clauses for readability
✅ **Indexes** — Performance optimization
✅ **Type Casting** — CAST operations
✅ **String Functions** — TO_CHAR, EXTRACT

---

## Prisma Advantages Over Raw SQL

```javascript
// Prisma: Type-safe, readable
const users = await prisma.user.findMany({
  where: { id: userId },
  include: { applications: { include: { job: true } } }
});

// Raw SQL: More control, harder to maintain
const result = await db.query(`
  SELECT u.*, a.*, j.*
  FROM users u
  LEFT JOIN applications a ON u.id = a.user_id
  LEFT JOIN jobs j ON a.job_id = j.id
  WHERE u.id = $1
`);
```

**Trade-offs:**
- **Prisma**: Safety, maintainability, developer experience
- **Raw SQL**: Performance control, complex queries, direct optimization

---

## Example: Full Analytics Query Flow

```javascript
// 1. Get all users (full table scan)
const allUsers = await prisma.user.findMany({
  select: { id: true, name: true, email: true, skills: true }
});
// Equivalent: SELECT id, name, email, skills FROM users

// 2. Get all applications with joins
const applications = await prisma.application.findMany({
  include: {
    user: { select: { skills: true } },
    job: { select: { requiredSkills: true } }
  }
});
// Equivalent: SELECT a.*, u.skills, j.required_skills 
//             FROM applications a
//             LEFT JOIN users u ON a.user_id = u.id
//             LEFT JOIN jobs j ON a.job_id = j.id

// 3. Process in application (in-memory aggregation)
const skillCounts = {};
users.forEach(u => {
  u.skills.forEach(skill => {
    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
  });
});

// 4. Sort and limit (ORDER BY + LIMIT)
const topSkills = Object.entries(skillCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
```

---

## Performance Considerations

### Current Implementation
- ✅ Efficient for small-medium datasets (< 100k users)
- ⚠️ Full table scans for analytics (may need caching)
- ✅ Indexed primary key lookups

### Scaling Recommendations
1. **Add PostgreSQL indexes** on frequently queried columns
2. **Cache analytics** results (Redis) with 6-hour TTL
3. **Denormalize scores** (career_scores table) instead of calculating every time
4. **Use pagination** for large result sets
5. **Consider materialized views** for common aggregations

---

## Summary

The Intelligence Module demonstrates:
- ✅ Relational database design
- ✅ Proper normalization
- ✅ Complex queries with joins
- ✅ Aggregation and analysis
- ✅ ORM best practices
- ✅ Array operations in modern DBMS
- ✅ Performance indexing
- ✅ Data integrity with foreign keys

This is a **DBMS-first application**, not a typical web service!

