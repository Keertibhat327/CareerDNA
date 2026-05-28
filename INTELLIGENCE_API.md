# CareerDNA AI — Intelligence Module API Documentation

## Overview

The Intelligence Module provides AI-powered career scoring, ATS matching, and skill recommendations using weighted SQL-based logic without real machine learning or complex AI models.

### Core Features

1. **Career DNA Score Engine** — Role compatibility analysis
2. **ATS Resume Matching** — Job requirement matching
3. **Skill Gap Recommendations** — Personalized learning paths
4. **Fake AI Insights** — Rule-based intelligent recommendations
5. **Analytics Dashboard** — Comprehensive hiring intelligence

---

## API Endpoints

### 1. Career DNA Score Engine

#### Endpoint: `GET /career-dna/:userId`

Calculates role compatibility scores using weighted skill matching.

**Parameters:**
- `userId` (string, required) — UUID of the user

**Headers:**
- `Authorization` (optional) — Bearer token for authentication

**Response:**
```json
{
  "AIML Engineer": 75,
  "Backend Developer": 85,
  "Data Analyst": 60,
  "insights": [
    "Your technical profile shows stronger backend engineering alignment.",
    "Your profile lacks key industry-required technology skills."
  ]
}
```

**Scoring Formula:**
```
matchPercentage = (userMatchingSkillWeights / totalRoleWeights) × 100
```

**Role Skill Weights:**

| Role | Skills | Weights |
|------|--------|---------|
| AIML Engineer | Python, SQL, Machine Learning, TensorFlow | 10, 8, 10, 9 |
| Backend Developer | Node.js, Express.js, PostgreSQL, Docker | 10, 9, 8, 7 |
| Data Analyst | SQL, Python, Power BI, Excel | 10, 8, 9, 7 |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/career-dna/user-uuid-123" \
  -H "Authorization: Bearer your_jwt_token"
```

**Use Cases:**
- Student dashboard to show career alignment
- Career path recommendations
- Self-assessment tool

---

### 2. ATS Score Calculation

#### Endpoint: `GET /ats-score/:userId/:jobId`

Calculates ATS (Applicant Tracking System) score by comparing user skills with job requirements.

**Parameters:**
- `userId` (string, required) — UUID of the user
- `jobId` (string, required) — UUID of the job posting

**Headers:**
- `Authorization` (optional) — Bearer token

**Response:**
```json
{
  "atsScore": 78,
  "matchedSkills": [
    "JavaScript",
    "React",
    "PostgreSQL"
  ],
  "missingSkills": [
    "Docker",
    "Kubernetes",
    "AWS"
  ],
  "insight": "Good compatibility. Consider practicing SQL or Docker to close the skill gap."
}
```

**Scoring Formula:**
```
atsScore = (matchingSkills / totalRequiredSkills) × 100
```

**Insight Rules:**
- Score < 50: "Your profile lacks key industry-required backend technologies."
- Score ≥ 80: "You are highly compatible with this role. Ready to apply!"
- Score 50-80: "Good compatibility. Consider practicing SQL or Docker to close the skill gap."

**Example Request:**
```bash
curl -X GET "http://localhost:5000/ats-score/user-123/job-456" \
  -H "Authorization: Bearer your_jwt_token"
```

**Use Cases:**
- Job application compatibility check
- Resume screening automation
- Candidate filtering for recruiters

---

### 3. Skill Gap & Recommendations

#### Endpoint: `GET /recommendations/:userId`

Analyzes user's skill gaps and generates personalized recommendations.

**Parameters:**
- `userId` (string, required) — UUID of the user

**Headers:**
- `Authorization` (optional) — Bearer token

**Response:**
```json
{
  "missingSkills": [
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "TensorFlow",
    "AWS"
  ],
  "recommendations": [
    "Learn Docker fundamentals (containers, images, docker-compose)",
    "Learn container orchestration with Kubernetes",
    "Study machine learning algorithms, model training, and evaluation",
    "Build and train deep learning models using TensorFlow",
    "Explore cloud services and deployment on AWS",
    "Build backend projects and learn SQL query optimization"
  ]
}
```

**Recommendation Mapping:**
- Extracted from user's applied jobs
- Falls back to top 10 jobs if no applications
- Categorized by skill type (backend, frontend, AI/ML)

**Example Request:**
```bash
curl -X GET "http://localhost:5000/recommendations/user-uuid-123" \
  -H "Authorization: Bearer your_jwt_token"
```

**Use Cases:**
- Personalized learning recommendations
- Skill development planning
- Career path guidance

---

### 4. Analytics Dashboard

#### Endpoint: `GET /analytics`

Retrieves comprehensive analytics data for recruiter/admin dashboard.

**Parameters:**
- None

**Headers:**
- `Authorization` (optional) — Bearer token

**Response:**
```json
{
  "topSkills": [
    { "skill": "Python", "count": 45 },
    { "skill": "SQL", "count": 38 },
    { "skill": "React", "count": 32 },
    { "skill": "Node.js", "count": 28 },
    { "skill": "PostgreSQL", "count": 25 },
    { "skill": "Docker", "count": 22 },
    { "skill": "JavaScript", "count": 20 },
    { "skill": "Express.js", "count": 18 },
    { "skill": "TypeScript", "count": 15 },
    { "skill": "MongoDB", "count": 12 }
  ],
  "candidateRanking": [
    {
      "id": "user-1",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "topScore": 92,
      "skills": ["Python", "SQL", "TensorFlow", "Machine Learning"]
    },
    {
      "id": "user-2",
      "name": "Bob Smith",
      "email": "bob@example.com",
      "topScore": 88,
      "skills": ["Node.js", "Express.js", "PostgreSQL", "Docker"]
    }
  ],
  "roleCompatibility": {
    "AIML Engineer": 72,
    "Backend Developer": 78,
    "Data Analyst": 65
  },
  "atsAverages": 71,
  "applicationTrends": [
    { "date": "Mon", "applications": 12 },
    { "date": "Tue", "applications": 8 },
    { "date": "Wed", "applications": 15 },
    { "date": "Thu", "applications": 11 },
    { "date": "Fri", "applications": 9 },
    { "date": "Sat", "applications": 3 },
    { "date": "Sun", "applications": 2 }
  ]
}
```

**Data Breakdown:**

| Field | Description |
|-------|-------------|
| topSkills | Top 10 most common skills among all users |
| candidateRanking | Top 10 candidates ranked by highest compatibility score |
| roleCompatibility | Average compatibility percentage for each role |
| atsAverages | Average ATS score across all applications |
| applicationTrends | Application volume by day of week |

**Example Request:**
```bash
curl -X GET "http://localhost:5000/analytics" \
  -H "Authorization: Bearer your_jwt_token"
```

**Use Cases:**
- Recruiter dashboard metrics
- Platform analytics and insights
- Candidate pool analysis

---

## Scoring Logic

### Career DNA Scoring Algorithm

1. **Extract user skills** from database
2. **Canonicalize skills** (normalize variations: "Node.js" → "node.js", "postgres" → "postgresql")
3. **For each role:**
   - Sum weights of matching skills
   - Calculate percentage: `(matchingWeights / totalWeights) × 100`
4. **Generate insights** based on score ranges and comparisons

### ATS Scoring Algorithm

1. **Fetch user and job from database**
2. **Compare skills** (canonicalized)
3. **Count matches** and missing skills
4. **Calculate ATS score:** `(matched / required) × 100`
5. **Generate contextual insight** based on score

### Skill Canonicalization

Handles common variations:
- "Node.js" | "Node" | "nodejs" → "node.js"
- "Express.js" | "Express" → "express.js"
- "PostgreSQL" | "Postgres" | "MySQL" → "postgresql"
- "Power BI" | "PowerBI" | "Tableau" → "power bi"
- "Machine Learning" | "ML" | "AI/ML" → "machine learning"

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (missing parameters) |
| 404 | Resource not found (user or job) |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden (expired token) |
| 500 | Server error |

**Error Response Format:**
```json
{
  "error": "User not found."
}
```

---

## Integration Guide

### Frontend Integration (React/Next.js)

```javascript
// Fetch career DNA scores
async function getCareerDNA(userId) {
  const response = await fetch(`/career-dna/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

// Fetch ATS score before application
async function checkJobFit(userId, jobId) {
  const response = await fetch(`/ats-score/${userId}/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

// Get learning recommendations
async function getRecommendations(userId) {
  const response = await fetch(`/recommendations/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

### Dashboard Integration

```javascript
// Recruiter dashboard
async function loadDashboard() {
  const analytics = await fetch('/analytics', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  return {
    topSkills: analytics.topSkills,
    candidateRanking: analytics.candidateRanking,
    roleCompatibility: analytics.roleCompatibility
  };
}
```

---

## Performance Notes

- **Caching**: Consider caching analytics data (recalculate every 1-6 hours)
- **Database Indexes**: Ensure indexes on `users.id`, `jobs.id`, `applications.user_id`, `applications.job_id`
- **Query Optimization**: Recommendation and analytics endpoints perform full table scans; optimize for larger datasets

---

## Future Enhancements

1. Add Fullstack Developer and DevOps Engineer roles
2. Implement skill trend analysis over time
3. Add machine learning-based collaborative filtering for recommendations
4. Real-time dashboard updates with WebSockets
5. Export analytics as CSV/PDF reports
6. A/B testing for skill weight optimization

---

## Example Integration Flow

### Candidate Journey

```
1. User creates profile and adds skills
   ↓
2. User checks Career DNA score
   → Shows alignment with AIML/Backend/Data Analyst roles
   ↓
3. User browses jobs and sees job details
   ↓
4. Before applying, system calculates ATS score
   → Shows skill match percentage and missing skills
   ↓
5. If ATS < 80%, show recommendations
   ↓
6. User applies or views recommendations
```

### Recruiter Journey

```
1. Recruiter posts a job
   ↓
2. System receives applications
   ↓
3. Each application gets ATS score automatically
   ↓
4. Recruiter views analytics dashboard
   → Top candidates ranked by compatibility
   → Role compatibility trends
   → Application metrics
```

---

## Testing Examples

### cURL Commands

```bash
# Get Career DNA Score
curl -X GET "http://localhost:5000/career-dna/user-uuid-123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Get ATS Score
curl -X GET "http://localhost:5000/ats-score/user-123/job-456" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Get Recommendations
curl -X GET "http://localhost:5000/recommendations/user-uuid-123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Get Analytics
curl -X GET "http://localhost:5000/analytics" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Using Postman

1. Create a new collection "CareerDNA Intelligence"
2. Add GET requests for each endpoint
3. Set Authorization header with valid JWT token
4. Test with various user IDs and job IDs

---

## File Structure

```
src/
├── controllers/
│   ├── intelligenceController.js    # All scoring and analytics logic
│   ├── scoreController.js
│   ├── atsController.js
│   └── ...
├── routes/
│   ├── intelligenceRoutes.js        # Intelligence module routes
│   ├── scoreRoutes.js
│   ├── atsRoutes.js
│   └── ...
├── middleware/
│   └── authMiddleware.js            # Authentication and optional auth
├── utils/
│   └── jwt.js
└── config/
    └── db.js                        # Prisma database client
```

---

## Environment Variables

No additional environment variables needed. Uses existing `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT verification

---

## Author Notes

- **No real AI used** — All intelligence is rule-based and weight-based
- **SQL-driven** — Leverages database queries and Prisma ORM
- **Scalable scoring** — Easy to add new roles or adjust weights
- **Lightweight** — No external ML libraries or API calls
- **DBMS demonstration** — Shows complex joins, aggregations, and data processing

