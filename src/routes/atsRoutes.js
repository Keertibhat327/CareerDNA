import { Router } from 'express';
import { calculateAtsScore } from '../controllers/atsController.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Route for calculating ATS resume-to-job matching score
router.post('/ats-score', optionalAuthenticate, calculateAtsScore);

export default router;
