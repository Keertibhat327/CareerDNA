import type {
  AuthResponse,
  Job,
  Application,
  CareerScoreResult,
  AtsScoreResult,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cdna_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  signup: (body: {
    email: string;
    password: string;
    role: string;
    name?: string;
    companyName?: string;
    skills?: string[];
  }) => request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string; role: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
};

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const jobsApi = {
  getAll: () => request<Job[]>("/jobs"),

  create: (body: { title: string; description: string; requiredSkills: string[] }) =>
    request<{ message: string; job: Job }>("/jobs", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  apply: (jobId: string) =>
    request<{ message: string; application: Application }>("/apply", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }),
};

// ─── Scores ──────────────────────────────────────────────────────────────────

export const scoresApi = {
  careerScore: (skills?: string[]) =>
    request<CareerScoreResult>("/career-score", {
      method: "POST",
      body: JSON.stringify(skills ? { skills } : {}),
    }),

  atsScore: (body: {
    userSkills?: string[];
    jobRequiredSkills?: string[];
    jobId?: string;
  }) =>
    request<AtsScoreResult>("/ats-score", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
