# Intelligence Module — Quick Reference Guide

## 🚀 Quick Start

### Endpoints (4 Total)

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/career-dna/:userId` | GET | Career role compatibility scores | Optional |
| `/ats-score/:userId/:jobId` | GET | Job match percentage | Optional |
| `/recommendations/:userId` | GET | Personalized skill recommendations | Optional |
| `/analytics` | GET | Dashboard analytics data | Optional |

---

## 📋 Response Format

### Career DNA
```json
{
  "AIML Engineer": 75,
  "Backend Developer": 85,
  "Data Analyst": 60,
  "insights": ["Your profile shows stronger backend alignment..."]
}
```

### ATS Score
```json
{
  "atsScore": 78,
  "matchedSkills": ["React", "SQL"],
  "missingSkills": ["Docker", "Kubernetes"],
  "insight": "Good compatibility..."
}
```

### Recommendations
```json
{
  "missingSkills": ["Docker", "Kubernetes"],
  "recommendations": [
    "Learn Docker fundamentals...",
    "Learn container orchestration..."
  ]
}
```

### Analytics
```json
{
  "topSkills": [...],
  "candidateRanking": [...],
  "roleCompatibility": {...},
  "atsAverages": 71,
  "applicationTrends": [...]
}
```

---

## 🔑 Role Weights

| Role | Key Skills |
|------|-----------|
| **AIML Engineer** | Python (10), Machine Learning (10), TensorFlow (9), SQL (8) |
| **Backend Developer** | Node.js (10), Express.js (9), PostgreSQL (8), Docker (7) |
| **Data Analyst** | SQL (10), Python (8), Power BI (9), Excel (7) |

---

## 🛠️ Quick Test

### Get all scores for a user
```bash
curl "http://localhost:5000/career-dna/user-123"
```

### Check job compatibility
```bash
curl "http://localhost:5000/ats-score/user-123/job-456"
```

### Get learning recommendations
```bash
curl "http://localhost:5000/recommendations/user-123"
```

### Get dashboard analytics
```bash
curl "http://localhost:5000/analytics"
```

---

## 📊 Scoring Formula

### Career DNA
```
Score = (user's matching skill weights / total role weights) × 100
```

### ATS
```
Score = (number of matching skills / total required skills) × 100
```

---

## 🎯 Insight Rules

### Career DNA Insights
- **> 80%**: "You are highly aligned with [ROLE] roles."
- **Best fit**: "Your profile shows stronger [TOP ROLE] alignment."
- **All < 50%**: "Your profile lacks key technology skills."

### ATS Insights
- **< 50%**: "Your profile lacks key technologies."
- **≥ 80%**: "You are highly compatible. Ready to apply!"
- **50-80%**: "Good compatibility. Consider learning [SKILL]."

---

## 🔄 Data Flow

### Step 1: User Data
```
User Profile → Skills (array of strings)
```

### Step 2: Canonicalization
```
"Node.js" → normalize → "node.js"
"NodeJS" → normalize → "node.js"
"nodejs" → normalize → "node.js"
```

### Step 3: Matching
```
For each role:
  matching_weight = sum of user's skill weights
  total_weight = sum of all role weights
  score = (matching_weight / total_weight) × 100
```

### Step 4: Insights
```
Apply rules based on score ranges
Generate "AI-like" recommendations
```

---

## 🗂️ File Locations

| Component | File |
|-----------|------|
| Routes | `src/routes/intelligenceRoutes.js` |
| Controllers | `src/controllers/intelligenceController.js` |
| Auth Middleware | `src/middleware/authMiddleware.js` |
| Main Server | `src/index.js` |

---

## 💡 Key Features

✅ **No Real AI** — Simple, rule-based logic
✅ **SQL-Based** — Leverages database queries
✅ **Weighted Scoring** — Configurable skill weights
✅ **Fake Insights** — Looks intelligent, stays lightweight
✅ **DBMS-Focused** — Demonstrates database concepts
✅ **Production-Ready** — Error handling, validation

---

## 🔧 Customization

### Add a New Role

```javascript
// In intelligenceController.js
const ROLE_WEIGHTS = {
  // ... existing roles
  'DevOps Engineer': {
    'kubernetes': 10,
    'docker': 9,
    'aws': 8,
    'terraform': 8
  }
};
```

### Change Skill Weights

```javascript
const ROLE_WEIGHTS = {
  'Backend Developer': {
    'node.js': 10,  // Change from 10 to 9
    'express.js': 9,
    'postgresql': 8,
    'docker': 7
  }
};
```

### Add Recommendations

```javascript
const RECOMMENDATION_MAPPING = {
  // ... existing
  'go': 'Learn Go language for concurrent systems and microservices',
  'rust': 'Master Rust for systems programming and performance'
};
```

---

## 📱 Frontend Usage

### React Hook
```javascript
const [careerScores, setCareerScores] = useState(null);

useEffect(() => {
  fetch(`/career-dna/${userId}`)
    .then(r => r.json())
    .then(setCareerScores);
}, [userId]);
```

### Before Job Application
```javascript
const checkJobFit = async (userId, jobId) => {
  const res = await fetch(`/ats-score/${userId}/${jobId}`);
  return res.json(); // { atsScore, matchedSkills, missingSkills, insight }
};
```

### Dashboard Load
```javascript
const loadDashboard = async () => {
  const res = await fetch('/analytics');
  const { topSkills, candidateRanking, roleCompatibility } = await res.json();
  // Display in charts/cards
};
```

---

## 🎓 What It Demonstrates

- ✅ REST API design
- ✅ Database queries with Prisma
- ✅ Aggregation and ranking
- ✅ Error handling
- ✅ Optional authentication
- ✅ Complex data transformations
- ✅ Rule-based logic
- ✅ Analytics calculations

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| User not found | Verify userId exists in database |
| Empty skills array | Add skills to user profile first |
| ATS score 0% | Job has no required_skills |
| No recommendations | Add job applications to account |
| Analytics empty | Seed database with test data |

---

## 📈 Performance Tips

1. **Cache analytics** — Recalculate every 6 hours
2. **Index skills** — Add database index on skills
3. **Pagination** — Limit results for large datasets
4. **Use Redis** — Cache frequently accessed endpoints

---

## 📖 Full Documentation

For complete details, see:
- `INTELLIGENCE_API.md` — Full endpoint reference
- `IMPLEMENTATION_SUMMARY.md` — Architecture overview
- `src/controllers/intelligenceController.js` — Source code

---

## ✅ Verification Checklist

- [ ] intelligenceRoutes.js created
- [ ] index.js updated with route registration
- [ ] All 4 endpoints returning data
- [ ] Career DNA scores calculating correctly
- [ ] ATS scores matching expectations
- [ ] Recommendations generating
- [ ] Analytics aggregating
- [ ] No errors in browser console
- [ ] Database has test data

---

**Ready to use!** 🚀

