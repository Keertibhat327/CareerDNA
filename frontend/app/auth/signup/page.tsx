"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GlassCard from "@/components/ui/GlassCard";

const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Node.js", "React", "SQL",
  "PostgreSQL", "MongoDB", "TensorFlow", "PyTorch", "Machine Learning",
  "Deep Learning", "NLP", "Express", "Docker", "AWS", "Pandas", "Tableau",
];

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<"student" | "recruiter">("student");
  const [form, setForm] = useState({ email: "", password: "", name: "", companyName: "" });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: any = { ...form, role };
      if (role === "student") payload.skills = skills;
      const res = await authApi.signup(payload);
      login(res.token, res.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (s) => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-purple-600/[0.06] blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-md">
              <span className="text-white font-black text-lg">C</span>
            </div>
            <span className="text-2xl font-black text-white">
              Career<span className="gradient-text">DNA</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create account</h1>
          <p className="text-white/35">Start your AI-powered career journey</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          <GlassCard className="neon-border" hover={false} depth="floating">
            {/* Role toggle */}
            <div className="flex rounded-xl bg-white/[0.04] p-1 mb-6 border border-white/[0.06]">
              {(["student", "recruiter"] as const).map((r) => (
                <motion.button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    role === r
                      ? "bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-glow-sm"
                      : "text-white/35 hover:text-white/60"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {r === "student" ? "👨‍💻 Student" : "🏢 Recruiter"}
                </motion.button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {role === "student" ? (
                  <motion.div key="student" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Input label="Full Name" placeholder="Alex Johnson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required icon={<span className="text-sm">👤</span>} />
                  </motion.div>
                ) : (
                  <motion.div key="recruiter" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <Input label="Company Name" placeholder="Acme Corp" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required icon={<span className="text-sm">🏢</span>} />
                  </motion.div>
                )}
              </AnimatePresence>

              <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required icon={<span className="text-sm">✉️</span>} />
              <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required icon={<span className="text-sm">🔒</span>} />

              {/* Skills for students */}
              <AnimatePresence>
                {role === "student" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                        Skills
                        <span className="text-white/25 font-normal text-xs">(optional)</span>
                        {skills.length > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/25">
                            {skills.length}
                          </span>
                        )}
                      </label>

                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s) => (
                            <motion.span
                              key={s}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="skill-tag cursor-pointer group"
                              onClick={() => removeSkill(s)}
                            >
                              {s}
                              <span className="ml-1.5 text-white/20 group-hover:text-red-400 transition-colors text-xs">×</span>
                            </motion.span>
                          ))}
                        </div>
                      )}

                      <input
                        className="input-glow w-full rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 px-4 py-3 text-sm transition-all duration-200"
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

                      {filteredSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {filteredSuggestions.map((s) => (
                            <motion.button
                              key={s}
                              type="button"
                              onClick={() => addSkill(s)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/35 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              + {s}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-2"
                >
                  <span>⚠️</span> {error}
                </motion.div>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Create Account
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-sm text-white/35">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
