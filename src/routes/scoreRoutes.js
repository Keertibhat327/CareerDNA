import { Router } from 'express';
import { calculateCareerScore } from '../controllers/scoreController.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Route for computing Career DNA scores
router.post('/career-score', optionalAuthenticate, calculateCareerScore);

export default router;
