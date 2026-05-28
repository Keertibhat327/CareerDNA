"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { jobsApi } from "@/lib/api";
import PageWrapper from "@/components/layout/PageWrapper";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "TypeScript", "Node.js", "React", "Vue.js",
  "SQL", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "TensorFlow", "PyTorch", "Machine Learning",
  "Deep Learning", "NLP", "Express", "FastAPI", "Django", "Pandas",
  "Tableau", "Power BI", "Spark", "Kafka", "GraphQL", "REST APIs",
];

export default function PostJobPage() {
  const { user, isRecruiter } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user || !isRecruiter) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-xl font-bold text-white mb-2">Recruiter access only</p>
          <Link href="/auth/login">
            <Button className="mt-4">Sign in as Recruiter</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setError("Title and description are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await jobsApi.create({ ...form, requiredSkills: skills });
      setSuccess(true);
      setTimeout(() => router.push("/jobs"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageWrapper>
        <div className="max-w-md mx-auto text-center py-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-5xl mx-auto mb-6 shadow-glow-green">
              ✓
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Job Posted!</h2>
            <p className="text-white/50">Redirecting to job listings...</p>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">← Back to Jobs</Button>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Post a Job</h1>
            <p className="text-white/40">Reach thousands of qualified candidates</p>
          </div>

          <GlassCard className="neon-border" hover={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Job Title"
                placeholder="e.g. Senior Backend Developer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                icon={<span className="text-sm">💼</span>}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">Job Description</label>
                <textarea
                  className="input-glow w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-3 text-sm transition-all duration-200 resize-none"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              {/* Skills */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/70">
                  Required Skills
                  <span className="text-white/30 font-normal ml-1">({skills.length} added)</span>
                </label>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="skill-tag cursor-pointer group"
                        onClick={() => removeSkill(s)}
                      >
                        {s}
                        <span className="ml-1 text-white/30 group-hover:text-red-400 transition-colors">×</span>
                      </span>
                    ))}
                  </div>
                )}

                <input
                  className="input-glow w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-3 text-sm transition-all duration-200"
                  placeholder="Type a skill and press Enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                />

                <div className="flex flex-wrap gap-1.5 mt-1">
                  {SKILL_SUGGESTIONS.filter(
                    (s) => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
                  ).slice(0, 10).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {/* Preview */}
              {(form.title || skills.length > 0) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl bg-white/3 border border-white/8"
                >
                  <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Preview</p>
                  <p className="font-bold text-white">{form.title || "Job Title"}</p>
                  <p className="text-sm text-white/50">{(user as any).companyName}</p>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills.map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                🚀 Post Job
              </Button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
