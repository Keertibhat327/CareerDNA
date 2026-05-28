// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = "student" | "recruiter";

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: "student";
  skills: string[];
}

export interface RecruiterUser {
  id: string;
  companyName: string;
  email: string;
  role: "recruiter";
}

export type AuthUser = StudentUser | RecruiterUser;

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  recruiterId: string;
  recruiter: {
    id: string;
    companyName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Applications ────────────────────────────────────────────────────────────

export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  job: {
    title: string;
    recruiter: { companyName: string };
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Scores ──────────────────────────────────────────────────────────────────

export interface CareerScoreResult {
  inputSkills: string[] | string;
  normalizedSkills: string[];
  careerDNAScores: Record<string, string>;
}

export interface AtsScoreResult {
  atsScore: string;
  matchingSkills: string[];
  missingSkills: string[];
  message?: string;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}
