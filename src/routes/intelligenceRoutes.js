import { Router } from 'express';
import {
    getCareerDNA,
    getAtsScore,
    getRecommendations,
    getAnalytics
} from '../controllers/intelligenceController.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * TASK 1: Career DNA Score Engine
 * GET /career-dna/:userId
 * 
 * Calculates role compatibility scores for user against predefined roles:
 * - AIML Engineer
 * - Backend Developer
 * - Data Analyst
 * 
 * Returns weighted skill matching percentages and AI insights.
 */
router.get('/career-dna/:userId', optionalAuthenticate, getCareerDNA);

/**
 * TASK 2: ATS Score System
 * GET /ats-score/:userId/:jobId
 * 
 * Calculates ATS (Applicant Tracking System) score by comparing:
 * - User's skills vs Job's required skills
 * 
 * Returns:
 * - atsScore (percentage match)
 * - matchedSkills (skills user has)
 * - missingSkills (skills user lacks)
 * - insight (AI-style recommendation)
 */
router.get('/ats-score/:userId/:jobId', optionalAuthenticate, getAtsScore);

/**
 * TASK 4: Skill Gap Recommendation System
 * GET /recommendations/:userId
 * 
 * Analyzes user's skill gaps based on applied jobs and generates:
 * - Missing skills list
 * - Personalized recommendations to bridge skill gaps
 * - High-level action items
 */
router.get('/recommendations/:userId', optionalAuthenticate, getRecommendations);

/**
 * TASK 5: Analytics Data APIs
 * GET /analytics
 * 
 * Returns comprehensive analytics dashboard data:
 * - topSkills: Most common skills among all users
 * - candidateRanking: Top 10 candidates by compatibility score
 * - roleCompatibility: Average compatibility scores per role
 * - atsAverages: Average ATS score across all applications
 * - applicationTrends: Application volume by weekday
 * 
 * Used to populate recruiter and admin dashboards.
 */
router.get('/analytics', optionalAuthenticate, getAnalytics);

export default router;
