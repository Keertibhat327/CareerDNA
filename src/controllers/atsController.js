import prisma from '../config/db.js';

/**
 * Maps common variations of skill names to their canonical forms.
 */
function canonicalizeSkill(skill) {
  return skill.trim().toLowerCase()
    .replace(/\.js$/, '') // normalize node.js to node, express.js to express
    .replace(/\s+/g, '');  // remove spaces: 'power bi' to 'powerbi'
}

/**
 * ATS Match score calculation.
 */
export async function calculateAtsScore(req, res) {
  try {
    let { userSkills, jobRequiredSkills, jobId } = req.body;

    // Smart Integration: If jobId is provided, retrieve job and user details from DB
    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { requiredSkills: true, title: true }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found for the given jobId.' });
      }

      jobRequiredSkills = job.requiredSkills;

      // If authenticated as student, automatically load student's skills
      if (req.user && req.user.role === 'student') {
        const student = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { skills: true }
        });
        if (student) {
          userSkills = student.skills;
        }
      }
    }

    if (!userSkills || !jobRequiredSkills) {
      return res.status(400).json({
        error: 'Both userSkills and jobRequiredSkills must be provided, or a jobId (with authentication for userSkills).'
      });
    }

    // Helper to parse input to list
    const parseToList = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') return input.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    };

    const userSkillsList = parseToList(userSkills);
    const jobSkillsList = parseToList(jobRequiredSkills);

    if (jobSkillsList.length === 0) {
      return res.status(200).json({
        atsScore: '100%',
        matchingSkills: [],
        missingSkills: [],
        message: 'No skills required for this job.'
      });
    }

    // Normalize user skills into a set for fast lookup
    const canonicalUserSkills = new Set(userSkillsList.map(canonicalizeSkill));

    // Analyze matches
    const matchingSkills = [];
    const missingSkills = [];

    jobSkillsList.forEach(originalSkill => {
      const canonicalReqSkill = canonicalizeSkill(originalSkill);
      if (canonicalUserSkills.has(canonicalReqSkill)) {
        matchingSkills.push(originalSkill);
      } else {
        missingSkills.push(originalSkill);
      }
    });

    const matchPercentage = Math.round((matchingSkills.length / jobSkillsList.length) * 100);

    res.status(200).json({
      atsScore: `${matchPercentage}%`,
      matchingSkills,
      missingSkills
    });
  } catch (error) {
    console.error('ATS score calculation error:', error);
    res.status(500).json({ error: 'Internal server error while calculating ATS score.' });
  }
}
