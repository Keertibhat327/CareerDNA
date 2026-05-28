import prisma from '../config/db.js';

// Predefined roles and skill weights
const ROLE_SKILLS = {
  'AIML Engineer': {
    'python': 10,
    'ml': 9,
    'deep learning': 9,
    'nlp': 8,
    'tensorflow': 8,
    'pytorch': 8
  },
  'Backend Developer': {
    'nodejs': 10,
    'express': 9,
    'javascript': 8,
    'sql': 8,
    'postgresql': 8,
    'apis': 8,
    'mongodb': 7
  },
  'Data Analyst': {
    'sql': 10,
    'excel': 9,
    'python': 8,
    'tableau': 8,
    'powerbi': 8,
    'statistics': 7,
    'pandas': 8
  }
};

/**
 * Maps common variations of skill names to their canonical forms
 * to improve match accuracy (e.g., 'node.js' maps to 'nodejs').
 */
function canonicalizeSkill(skill) {
  const s = skill.trim().toLowerCase();
  if (s === 'node.js' || s === 'node') return 'nodejs';
  if (s === 'express.js') return 'express';
  if (s === 'machine learning' || s === 'ai/ml' || s === 'aiml') return 'ml';
  if (s === 'power bi') return 'powerbi';
  if (s === 'postgres') return 'postgresql';
  return s;
}

/**
 * Computes Career DNA score based on input skills.
 */
export async function calculateCareerScore(req, res) {
  try {
    let rawSkills = req.body.skills;

    // Optional integration: if skills are not passed, but the user is authenticated as a student,
    // fetch the student's skills from the database.
    if (!rawSkills && req.user && req.user.role === 'student') {
      const student = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { skills: true }
      });
      if (student) {
        rawSkills = student.skills;
      }
    }

    if (!rawSkills) {
      return res.status(400).json({
        error: 'Skills must be provided in the request body, or you must be logged in as a student with saved skills.'
      });
    }

    // Normalize skills to canonical representations
    let userSkillsList = [];
    if (Array.isArray(rawSkills)) {
      userSkillsList = rawSkills.map(canonicalizeSkill);
    } else if (typeof rawSkills === 'string') {
      userSkillsList = rawSkills.split(',').map(canonicalizeSkill);
    } else {
      return res.status(400).json({ error: 'Skills must be an array or a comma-separated string.' });
    }

    // Filter out empty strings
    userSkillsList = userSkillsList.filter(Boolean);

    const userSkillsSet = new Set(userSkillsList);
    const results = {};

    // Calculate percentage match for each pre-defined role
    for (const [roleName, skillWeights] of Object.entries(ROLE_SKILLS)) {
      const totalWeight = Object.values(skillWeights).reduce((sum, w) => sum + w, 0);
      let matchedWeight = 0;

      for (const [skillName, weight] of Object.entries(skillWeights)) {
        if (userSkillsSet.has(skillName)) {
          matchedWeight += weight;
        }
      }

      // Convert to percentage
      const percentage = Math.round((matchedWeight / totalWeight) * 100);
      results[roleName] = `${percentage}%`;
    }

    res.status(200).json({
      inputSkills: rawSkills,
      normalizedSkills: Array.from(userSkillsSet),
      careerDNAScores: results
    });
  } catch (error) {
    console.error('Calculate career score error:', error);
    res.status(500).json({ error: 'Internal server error while calculating career score.' });
  }
}
