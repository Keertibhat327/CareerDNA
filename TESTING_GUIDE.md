# CareerDNA AI — Testing Guide & Examples

## Pre-Test Requirements

Before testing, ensure:
1. ✅ Node.js backend is running on `http://localhost:5000`
2. ✅ PostgreSQL database is connected and has data
3. ✅ `.env` file configured with `DATABASE_URL`
4. ✅ Prisma migrations applied: `npx prisma migrate dev`
5. ✅ Test data seeded: `npm run seed` (or manual inserts)

---

## Test Data Setup

### Create Test Users

```sql
INSERT INTO users (id, name, email, password, skills, created_at, updated_at) VALUES
('user-001', 'Alice Johnson', 'alice@example.com', 'hashed_password', 
  '["Python", "SQL", "Machine Learning", "TensorFlow"]', NOW(), NOW()),
('user-002', 'Bob Smith', 'bob@example.com', 'hashed_password', 
  '["Node.js", "Express.js", "PostgreSQL", "Docker"]', NOW(), NOW()),
('user-003', 'Charlie Brown', 'charlie@example.com', 'hashed_password', 
  '["SQL", "Python", "Power BI", "Excel"]', NOW(), NOW()),
('user-004', 'David Lee', 'david@example.com', 'hashed_password', 
  '["React", "JavaScript", "CSS"]', NOW(), NOW());
```

### Create Test Jobs

```sql
INSERT INTO jobs (id, title, company, description, required_skills, recruiter_id, created_at, updated_at) VALUES
('job-001', 'AIML Engineer', 'TechCorp', 'AI/ML role', 
  '["Python", "SQL", "Machine Learning", "TensorFlow", "PyTorch"]', 'recruiter-001', NOW(), NOW()),
('job-002', 'Backend Developer', 'StartupXYZ', 'Backend API role', 
  '["Node.js", "Express.js", "PostgreSQL", "Docker", "Kubernetes"]', 'recruiter-001', NOW(), NOW()),
('job-003', 'Data Analyst', 'DataCorp', 'Analytics role', 
  '["SQL", "Python", "Power BI", "Excel", "Tableau"]', 'recruiter-002', NOW(), NOW()),
('job-004', 'Full Stack', 'WebAgency', 'Full stack role', 
  '["React", "Node.js", "PostgreSQL"]', 'recruiter-002', NOW(), NOW());
```

### Create Test Applications

```sql
INSERT INTO applications (id, user_id, job_id, status, created_at, updated_at) VALUES
('app-001', 'user-001', 'job-001', 'applied', NOW(), NOW()),
('app-002', 'user-002', 'job-002', 'applied', NOW(), NOW()),
('app-003', 'user-003', 'job-003', 'applied', NOW(), NOW()),
('app-004', 'user-004', 'job-004', 'applied', NOW(), NOW());
```

---

## Testing Methods

### 1. Using cURL

#### Test Career DNA Score
```bash
# Get Career DNA for Alice (AIML-focused skills)
curl -X GET "http://localhost:5000/career-dna/user-001"

# Expected Response:
# {
#   "AIML Engineer": 100,
#   "Backend Developer": 0,
#   "Data Analyst": 60,
#   "insights": [
#     "You are highly aligned with AIML Engineering roles.",
#     "Your profile shows stronger AIML engineering alignment."
#   ]
# }
```

#### Test ATS Score
```bash
# Alice applying to AIML role (should be high match)
curl -X GET "http://localhost:5000/ats-score/user-001/job-001"

# Expected Response:
# {
#   "atsScore": 80,
#   "matchedSkills": ["Python", "SQL", "Machine Learning", "TensorFlow"],
#   "missingSkills": ["PyTorch"],
#   "insight": "You are highly compatible with this role. Ready to apply!"
# }

# David applying to Backend role (should be low match)
curl -X GET "http://localhost:5000/ats-score/user-004/job-002"

# Expected Response:
# {
#   "atsScore": 0,
#   "matchedSkills": [],
#   "missingSkills": ["Node.js", "Express.js", "PostgreSQL", "Docker", "Kubernetes"],
#   "insight": "Your profile lacks key industry-required backend technologies."
# }
```

#### Test Recommendations
```bash
# Get recommendations for David (needs backend skills)
curl -X GET "http://localhost:5000/recommendations/user-004"

# Expected Response:
# {
#   "missingSkills": ["Node.js", "Express.js", "PostgreSQL", "Docker", "Kubernetes"],
#   "recommendations": [
#     "Learn Node.js event-driven architecture and asynchronous programming",
#     "Build REST APIs and express middleware from scratch",
#     "Practice PostgreSQL optimization and database design",
#     "Learn Docker fundamentals (containers, images, docker-compose)",
#     "Learn container orchestration with Kubernetes",
#     "Build backend projects and learn SQL query optimization"
#   ]
# }
```

#### Test Analytics
```bash
# Get dashboard analytics
curl -X GET "http://localhost:5000/analytics"

# Expected Response:
# {
#   "topSkills": [
#     { "skill": "SQL", "count": 2 },
#     { "skill": "Python", "count": 2 },
#     { "skill": "Node.js", "count": 1 },
#     { "skill": "Express.js", "count": 1 },
#     // ... more skills
#   ],
#   "candidateRanking": [
#     {
#       "id": "user-001",
#       "name": "Alice Johnson",
#       "email": "alice@example.com",
#       "topScore": 100,
#       "skills": ["Python", "SQL", "Machine Learning", "TensorFlow"]
#     },
#     // ... more candidates
#   ],
#   "roleCompatibility": {
#     "AIML Engineer": 50,
#     "Backend Developer": 50,
#     "Data Analyst": 50
#   },
#   "atsAverages": 65,
#   "applicationTrends": [
#     { "date": "Mon", "applications": 0 },
#     // ... rest of week
#   ]
# }
```

---

### 2. Using Postman

#### Create Collection

1. Open Postman
2. Create new collection: "CareerDNA Intelligence Tests"
3. Add the following requests:

#### Request 1: Career DNA
```
Method: GET
URL: http://localhost:5000/career-dna/user-001
Headers: (none required)
Tests:
  pm.test("Status is 200", function() {
    pm.response.to.have.status(200);
  });
  pm.test("Has scores", function() {
    pm.expect(pm.response.json()).to.have.property("AIML Engineer");
  });
  pm.test("Has insights", function() {
    pm.expect(pm.response.json().insights).to.be.an('array');
  });
```

#### Request 2: ATS Score
```
Method: GET
URL: http://localhost:5000/ats-score/user-001/job-001
Tests:
  pm.test("ATS score is between 0-100", function() {
    const score = pm.response.json().atsScore;
    pm.expect(score).to.be.within(0, 100);
  });
  pm.test("Has matchedSkills array", function() {
    pm.expect(pm.response.json().matchedSkills).to.be.an('array');
  });
  pm.test("Has missingSkills array", function() {
    pm.expect(pm.response.json().missingSkills).to.be.an('array');
  });
```

#### Request 3: Recommendations
```
Method: GET
URL: http://localhost:5000/recommendations/user-001
Tests:
  pm.test("Has missingSkills", function() {
    pm.expect(pm.response.json()).to.have.property("missingSkills");
  });
  pm.test("Has recommendations", function() {
    pm.expect(pm.response.json().recommendations).to.be.an('array');
  });
```

#### Request 4: Analytics
```
Method: GET
URL: http://localhost:5000/analytics
Tests:
  pm.test("Has topSkills", function() {
    pm.expect(pm.response.json().topSkills).to.be.an('array');
  });
  pm.test("Has candidateRanking", function() {
    pm.expect(pm.response.json().candidateRanking).to.be.an('array');
  });
  pm.test("Has roleCompatibility", function() {
    pm.expect(pm.response.json().roleCompatibility).to.be.an('object');
  });
```

---

### 3. Using Browser DevTools

```javascript
// Open browser console and paste:

// Get Career DNA
fetch('/career-dna/user-001')
  .then(r => r.json())
  .then(d => console.log('Career DNA:', d));

// Get ATS Score
fetch('/ats-score/user-001/job-001')
  .then(r => r.json())
  .then(d => console.log('ATS Score:', d));

// Get Recommendations
fetch('/recommendations/user-001')
  .then(r => r.json())
  .then(d => console.log('Recommendations:', d));

// Get Analytics
fetch('/analytics')
  .then(r => r.json())
  .then(d => console.log('Analytics:', d));
```

---

## Test Cases

### Test Case 1: Perfect Match (Alice → AIML Job)

**Scenario:** Alice (AIML skills) applies to AIML role

**Expected:**
- Career DNA AIML: ~80-100%
- ATS Score: ~80%+
- Insight: "Highly compatible"
- Status: PASS ✅

```bash
curl -X GET "http://localhost:5000/career-dna/user-001"
curl -X GET "http://localhost:5000/ats-score/user-001/job-001"
```

---

### Test Case 2: No Match (David → Backend Job)

**Scenario:** David (frontend skills) applies to backend role

**Expected:**
- Career DNA Backend: 0%
- ATS Score: 0%
- Insight: "Profile lacks key technologies"
- Status: PASS ✅

```bash
curl -X GET "http://localhost:5000/career-dna/user-004"
curl -X GET "http://localhost:5000/ats-score/user-004/job-002"
```

---

### Test Case 3: Partial Match (Bob → AIML Job)

**Scenario:** Bob (backend skills) applies to AIML role

**Expected:**
- Career DNA AIML: ~25-50%
- ATS Score: ~20%
- Insight: "Good compatibility" or "Lacks technologies"
- Status: PASS ✅

```bash
curl -X GET "http://localhost:5000/ats-score/user-002/job-001"
```

---

### Test Case 4: User Not Found Error

**Scenario:** Request with non-existent user

**Expected:**
- Status: 404
- Response: `{ "error": "User not found." }`
- Status: PASS ✅

```bash
curl -X GET "http://localhost:5000/career-dna/invalid-user-id"
```

---

### Test Case 5: Job Not Found Error

**Scenario:** Request with non-existent job

**Expected:**
- Status: 404
- Response: `{ "error": "Job not found." }`
- Status: PASS ✅

```bash
curl -X GET "http://localhost:5000/ats-score/user-001/invalid-job-id"
```

---

### Test Case 6: Analytics Data Consistency

**Scenario:** Analytics returned for multiple users/jobs

**Expected:**
- topSkills: All skills from all users counted
- candidateRanking: Users sorted by highest score
- roleCompatibility: Averages calculated correctly
- atsAverages: Reasonable number (not NaN)
- Status: PASS ✅

```bash
curl -X GET "http://localhost:5000/analytics" | jq '.candidateRanking'
```

---

### Test Case 7: Recommendations Logic

**Scenario:** User with applications gets job skill recommendations

**Expected:**
- missingSkills: Array from applied jobs
- recommendations: Corresponding to missing skills
- No duplicates in recommendations
- Status: PASS ✅

```bash
curl -X GET "http://localhost:5000/recommendations/user-004"
```

---

## Performance Tests

### Load Test (Simple)

```bash
# Run 100 requests to analytics endpoint
for i in {1..100}; do
  curl -s "http://localhost:5000/analytics" > /dev/null
  echo "Request $i completed"
done

echo "Load test completed"
```

### Benchmark Individual Endpoints

```bash
# Career DNA response time
time curl -X GET "http://localhost:5000/career-dna/user-001" > /dev/null

# ATS Score response time
time curl -X GET "http://localhost:5000/ats-score/user-001/job-001" > /dev/null

# Analytics response time (longest due to full aggregation)
time curl -X GET "http://localhost:5000/analytics" > /dev/null
```

---

## Debugging Checklist

| Issue | Solution |
|-------|----------|
| 404 User not found | Verify userId exists in database |
| 404 Job not found | Verify jobId exists in database |
| Empty recommendations | Check user has applications |
| 0% ATS score | Verify job has required_skills |
| No insights | Check score ranges in code |
| Slow analytics | Check database size, consider caching |

---

## Integration Test (Frontend)

### React Component Test

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import CareerDNAComponent from './CareerDNA';

test('renders career DNA scores', async () => {
  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        'AIML Engineer': 75,
        'Backend Developer': 85,
        'Data Analyst': 60,
        insights: ['Test insight']
      })
    })
  );

  render(<CareerDNAComponent userId="user-001" />);

  await waitFor(() => {
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });
});
```

---

## Continuous Integration (CI)

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Setup database
        run: npx prisma migrate dev
      
      - name: Test Career DNA endpoint
        run: curl http://localhost:5000/career-dna/user-001
      
      - name: Test Analytics endpoint
        run: curl http://localhost:5000/analytics
```

---

## Validation Checklist

Before deployment, verify:

- [ ] All 4 endpoints return 200 status
- [ ] Career DNA returns 3 role scores
- [ ] ATS returns score + matched/missing skills
- [ ] Recommendations returns array of strings
- [ ] Analytics returns all 5 data fields
- [ ] User not found returns 404
- [ ] Job not found returns 404
- [ ] Scores are between 0-100
- [ ] Arrays are properly formatted
- [ ] No undefined or null values in responses
- [ ] Error messages are descriptive
- [ ] Response times < 1 second (except analytics)

---

## Example Test Results

### ✅ All Tests Pass

```
Testing Career DNA Endpoint
─────────────────────────────────────────
GET /career-dna/user-001
✓ Status 200
✓ Response has AIML Engineer score
✓ Score between 0-100
✓ Has insights array
Time: 45ms

Testing ATS Score Endpoint
─────────────────────────────────────────
GET /ats-score/user-001/job-001
✓ Status 200
✓ Response has atsScore field
✓ Response has matchedSkills array
✓ Response has missingSkills array
✓ Response has insight string
Time: 38ms

Testing Recommendations Endpoint
─────────────────────────────────────────
GET /recommendations/user-001
✓ Status 200
✓ Response has missingSkills array
✓ Response has recommendations array
✓ Arrays are not empty
Time: 52ms

Testing Analytics Endpoint
─────────────────────────────────────────
GET /analytics
✓ Status 200
✓ Response has topSkills array
✓ Response has candidateRanking array
✓ Response has roleCompatibility object
✓ Response has atsAverages number
✓ Response has applicationTrends array
Time: 128ms

─────────────────────────────────────────
TOTAL: 20/20 tests passed ✓
```

---

## Troubleshooting

### Endpoint returns 500 Error

```javascript
// Check server logs for error
// Look for:
// 1. Database connection issues
// 2. Missing user/job ID
// 3. Null/undefined values
// 4. Prisma query errors

// Fix:
// - Verify DATABASE_URL in .env
// - Run migrations: npx prisma migrate dev
// - Seed data: npm run seed
// - Restart server
```

### Unexpected Score Values

```javascript
// Verify skill matching logic
// Check ROLE_WEIGHTS configuration
// Test skill canonicalization

// Debug:
console.log(userSkills); // See user's skills
console.log(roleWeights); // See role requirements
console.log(canonicalSkills); // See normalized skills
```

---

**Testing Complete!** 🎉

