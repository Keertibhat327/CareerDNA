import prisma from '../src/config/db.js';
import { signup, login } from '../src/controllers/authController.js';
import { createJob, getJobs, applyForJob } from '../src/controllers/jobController.js';
import { calculateCareerScore } from '../src/controllers/scoreController.js';
import { calculateAtsScore } from '../src/controllers/atsController.js';
import jwt from 'jsonwebtoken';

// Helper mock response builder
function mockResponse() {
  const res = {
    statusCode: 200,
    jsonPayload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.jsonPayload = payload;
      return this;
    }
  };
  return res;
}

// Simple test assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('==================================================');
  console.log('  Running CareerDNA Backend Logic Verification Tests');
  console.log('==================================================');

  // MOCK DATABASE STORE
  const db = {
    users: [],
    recruiters: [],
    jobs: [],
    applications: []
  };

  // MOCK PRISMA IMPLEMENTATION
  prisma.user = {
    findUnique: async ({ where }) => db.users.find(u => u.email === where.email),
    findFirst: async ({ where }) => db.users.find(u => u.email === where.email),
    create: async ({ data }) => {
      const newUser = { id: `user-uuid-${db.users.length + 1}`, ...data };
      db.users.push(newUser);
      return newUser;
    }
  };

  prisma.recruiter = {
    findUnique: async ({ where }) => db.recruiters.find(r => r.email === where.email),
    create: async ({ data }) => {
      const newRecruiter = { id: `recruiter-uuid-${db.recruiters.length + 1}`, ...data };
      db.recruiters.push(newRecruiter);
      return newRecruiter;
    }
  };

  prisma.job = {
    findUnique: async ({ where }) => db.jobs.find(j => j.id === where.id),
    findMany: async () => db.jobs,
    create: async ({ data }) => {
      const newJob = { id: `job-uuid-${db.jobs.length + 1}`, ...data, recruiter: { companyName: 'Mock Corp' } };
      db.jobs.push(newJob);
      return newJob;
    }
  };

  prisma.application = {
    findFirst: async ({ where }) => db.applications.find(a => a.userId === where.userId && a.jobId === where.jobId),
    create: async ({ data }) => {
      const newApp = { id: `app-uuid-${db.applications.length + 1}`, ...data, job: { title: 'Mock Job', recruiter: { companyName: 'Mock Corp' } } };
      db.applications.push(newApp);
      return newApp;
    }
  };

  // 1. TEST SIGNUP (STUDENT & RECRUITER)
  console.log('\n--- 1. Auth Signup Tests ---');
  {
    // Test Student Signup
    const req = {
      body: {
        email: 'test-student@example.com',
        password: 'password123',
        role: 'student',
        name: 'Test Student',
        skills: 'Python, SQL, Node.js'
      }
    };
    const res = mockResponse();
    await signup(req, res);
    
    assert(res.statusCode === 201, 'Student signup should return 201 Created');
    assert(res.jsonPayload.token !== undefined, 'Student signup should return a JWT token');
    assert(res.jsonPayload.user.email === 'test-student@example.com', 'Student email should match input');
    assert(res.jsonPayload.user.skills.length === 3, 'Student skills should be parsed into an array');
    assert(res.jsonPayload.user.skills[0] === 'Python', 'Skills should retain case or trimmed formatting');
  }
  {
    // Test Recruiter Signup
    const req = {
      body: {
        email: 'test-recruiter@example.com',
        password: 'password123',
        role: 'recruiter',
        companyName: 'Test Inc'
      }
    };
    const res = mockResponse();
    await signup(req, res);
    
    assert(res.statusCode === 201, 'Recruiter signup should return 201 Created');
    assert(res.jsonPayload.user.companyName === 'Test Inc', 'Recruiter company name should match input');
    assert(db.recruiters.length === 1, 'Recruiter record should be saved in DB');
  }

  // 2. TEST LOGIN (STUDENT & RECRUITER)
  console.log('\n--- 2. Auth Login Tests ---');
  {
    const req = {
      body: {
        email: 'test-student@example.com',
        password: 'password123',
        role: 'student'
      }
    };
    const res = mockResponse();
    await login(req, res);
    
    assert(res.statusCode === 200, 'Student login should return 200 OK');
    assert(res.jsonPayload.token !== undefined, 'Student login should return token');
  }
  {
    const req = {
      body: {
        email: 'test-student@example.com',
        password: 'wrongpassword',
        role: 'student'
      }
    };
    const res = mockResponse();
    await login(req, res);
    assert(res.statusCode === 401, 'Student login with wrong password should fail with 401');
  }

  // 3. TEST JOB POSTING & APPLICATIONS
  console.log('\n--- 3. Jobs & Application Tests ---');
  {
    // Recruiter posts a job
    const req = {
      user: { id: 'recruiter-uuid-1', role: 'recruiter' },
      body: {
        title: 'Software Developer',
        description: 'Excellent Node.js and SQL coding position.',
        requiredSkills: ['Node.js', 'SQL', 'Express']
      }
    };
    const res = mockResponse();
    await createJob(req, res);
    assert(res.statusCode === 201, 'Recruiter should be able to create a job');
    assert(db.jobs.length === 1, 'Job should be persisted');
  }
  {
    // Get Jobs
    const req = {};
    const res = mockResponse();
    await getJobs(req, res);
    assert(res.statusCode === 200, 'Getting jobs should return list of jobs');
    assert(res.jsonPayload.length === 1, 'Returned jobs list should contain 1 job');
  }
  {
    // Student applies to job
    const req = {
      user: { id: 'user-uuid-1', role: 'student' },
      body: { jobId: 'job-uuid-1' }
    };
    const res = mockResponse();
    await applyForJob(req, res);
    assert(res.statusCode === 201, 'Student should be able to apply to the job');
    assert(db.applications.length === 1, 'Application should be persisted');
  }

  // 4. TEST CAREER DNA SCORE
  console.log('\n--- 4. Career DNA Intelligence Tests ---');
  {
    // Test direct skills passing
    const req = {
      body: { skills: 'python, sql, tensorflow, pytorch' }
    };
    const res = mockResponse();
    await calculateCareerScore(req, res);
    assert(res.statusCode === 200, 'Career score computation should return 200');
    assert(res.jsonPayload.careerDNAScores['AIML Engineer'] !== undefined, 'Should calculate AIML Engineer score');
    assert(res.jsonPayload.careerDNAScores['Backend Developer'] !== undefined, 'Should calculate Backend Developer score');
    console.log('  Scores Computed:', res.jsonPayload.careerDNAScores);
  }

  // 5. TEST ATS MATCH SCORE
  console.log('\n--- 5. ATS Resume Analyzer Tests ---');
  {
    const req = {
      body: {
        userSkills: ['Python', 'SQL', 'Node.js'],
        jobRequiredSkills: ['Python', 'SQL', 'Machine Learning', 'Tensorflow']
      }
    };
    const res = mockResponse();
    await calculateAtsScore(req, res);
    assert(res.statusCode === 200, 'ATS Score calculation should succeed');
    assert(res.jsonPayload.atsScore === '50%', 'Score for 2/4 match should be 50%');
    assert(res.jsonPayload.missingSkills.includes('Machine Learning'), 'Missing list should include "Machine Learning"');
    assert(res.jsonPayload.missingSkills.includes('Tensorflow'), 'Missing list should include "Tensorflow"');
    console.log('  ATS Analysis Result:', res.jsonPayload);
  }

  console.log('\n==================================================');
  console.log('  All verification tests passed successfully!');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
