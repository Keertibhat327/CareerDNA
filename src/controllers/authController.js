import prisma from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Normalizes input skills to an array of trimmed strings.
 * Handles both string representation ("python, sql") and array representation.
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
 * Sign up controller for both Students and Recruiters.
 */
export async function signup(req, res) {
  try {
    const { email, password, role, name, companyName, skills } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    if (role !== 'student' && role !== 'recruiter') {
      return res.status(400).json({ error: 'Role must be either "student" or "recruiter".' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in either table to maintain email uniqueness
    const existingStudent = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const existingRecruiter = await prisma.recruiter.findUnique({ where: { email: normalizedEmail } });

    if (existingStudent || existingRecruiter) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = await hashPassword(password);

    let userPayload;
    if (role === 'student') {
      if (!name) {
        return res.status(400).json({ error: 'Name is required for students.' });
      }

      const normalizedSkillsList = normalizeSkills(skills);

      const newStudent = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          skills: normalizedSkillsList
        }
      });

      userPayload = {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        role: 'student',
        skills: newStudent.skills
      };
    } else {
      if (!companyName) {
        return res.status(400).json({ error: 'Company name is required for recruiters.' });
      }

      const newRecruiter = await prisma.recruiter.create({
        data: {
          companyName: companyName.trim(),
          email: normalizedEmail,
          password: hashedPassword
        }
      });

      userPayload = {
        id: newRecruiter.id,
        companyName: newRecruiter.companyName,
        email: newRecruiter.email,
        role: 'recruiter'
      };
    }

    // Generate JWT
    const token = generateToken({
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

/**
 * Login controller for both Students and Recruiters.
 */
export async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    if (role !== 'student' && role !== 'recruiter') {
      return res.status(400).json({ error: 'Role must be either "student" or "recruiter".' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let account;
    let userPayload;

    if (role === 'student') {
      account = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (account) {
        userPayload = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: 'student',
          skills: account.skills
        };
      }
    } else {
      account = await prisma.recruiter.findUnique({ where: { email: normalizedEmail } });
      if (account) {
        userPayload = {
          id: account.id,
          companyName: account.companyName,
          email: account.email,
          role: 'recruiter'
        };
      }
    }

    if (!account) {
      return res.status(401).json({ error: 'Invalid credentials or wrong role selection.' });
    }

    const passwordMatch = await comparePassword(password, account.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = generateToken({
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userPayload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}
