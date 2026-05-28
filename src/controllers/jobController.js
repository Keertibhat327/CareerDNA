import prisma from '../config/db.js';

/**
 * Normalizes input skills to an array of trimmed strings.
 */
function normalizeSkills(skillsInput) {
  if (!skillsInput) return [];
  if (Array.isArray(skillsInput)) {
    return skillsInput.map(s => s.trim()).filter(Boolean);
  }
  if (typeof skillsInput === 'string') {
    return skillsInput.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Recruiters can post jobs.
 */
export async function createJob(req, res) {
  try {
    const { title, description, requiredSkills } = req.body;
    const recruiterId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const normalizedSkills = normalizeSkills(requiredSkills);

    const newJob = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        requiredSkills: normalizedSkills,
        recruiterId
      },
      include: {
        recruiter: {
          select: {
            companyName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error while creating job.' });
  }
}

/**
 * Get all jobs, with recruiter info included.
 */
export async function getJobs(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        recruiter: {
          select: {
            id: true,
            companyName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error while retrieving jobs.' });
  }
}

/**
 * Students can apply for jobs.
 */
export async function applyForJob(req, res) {
  try {
    const { jobId } = req.body;
    const userId = req.user.id; // Student ID from authenticated token

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    // Verify the job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Check if student has already applied to this job
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId,
        jobId
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: 'PENDING'
      },
      include: {
        job: {
          select: {
            title: true,
            recruiter: {
              select: {
                companyName: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: 'Internal server error while applying for the job.' });
  }
}
