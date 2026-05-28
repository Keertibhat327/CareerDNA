import { Router } from 'express';
import { createJob, getJobs, applyForJob } from '../controllers/jobController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Recruiters can post jobs
router.post('/jobs', authenticateToken, requireRole('recruiter'), createJob);

// Anyone (students & recruiters) can view jobs
router.get('/jobs', getJobs);

// Students can apply for jobs
router.post('/apply', authenticateToken, requireRole('student'), applyForJob);

export default router;
