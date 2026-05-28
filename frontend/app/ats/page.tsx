"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { scoresApi } from "@/lib/api";
import type { AtsScoreResult } from "@/lib/types";
import { parseScore, getScoreColor, getScoreLabel } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import ScoreRing from "@/components/ui/ScoreRing";
import Badge from "@/components/ui/Badge";

export default function AtsPage() {
  const { user, isStudent } = useAuth();
  const [mode, setMode] = useState<"manual" | "profile">("profile");
  const [userSkillsInput, setUserSkillsInput] = useState("");
  const [jobSkillsInput, setJobSkillsInput] = useState("");
  const [result, setResult] = useState<AtsScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parseSkillsFromInput = (input: string): string[] =>
    input.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

  const handleAnalyze = async () => {
    setError("");
    setLoading(true);
    try {
      let payload: any = {};
      if (mode === "profile" && isStudent) {
        payload = {
          userSkills: (user as any)?.skills || [],
          jobRequiredSkills: parseSkillsFromInput(jobSkillsInput),
        };
      } else {
        payload = {
          userSkills: parseSkillsFromInput(userSkillsInput),
          jobRequiredSkills: parseSkillsFromInput(jobSkillsInput),
        };
      }
      if (!payload.jobRequiredSkills?.length) {
        setError("Please enter the job's required skills.");
        setLoading(false);
        return;
      }
      const res = await scoresApi.atsScore(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "ATS check failed");
    } finally {
      setLoading(false);
    }
  };

  const score = result ? parseScore(result.atsScore) : 0;
  const scoreColor = getScoreColor(score);
  const profileSkills: string[] = isStudent ? (user as any)?.skills || [] : [];

  const totalSkills = result ? result.matchingSkills.length + result.missingSkills.length : 0;
  const matchPct = totalSkills > 0 ? Math.round((result!.matchingSkills.length / totalSkills) * 100) : 0;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 border border-cyan-500/25 mb-5 shadow-glow-cyan"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <span>🎯</span>
            <span className="text-sm text-white/60">ATS Match Engine</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            ATS <span className="gradient-text">Score Checker</span>
          </h1>
          <p className="text-white/35 max-w-lg mx-auto text-lg">
            Compare your skills against any job's requirements. Know your match
            percentage before you apply and identify skill gaps instantly.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── Input panel ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: "spring" }}
          >
            <GlassCard className="neon-border-cyan h-full" hover={false} depth="floating">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
                  <span className="text-sm">⚙️</span>
                </div>
                <h2 className="text-base font-bold text-white">Configure Check</h2>
              </div>

              {/* Mode toggle */}
              {isStudent && (
                <div className="flex rounded-xl bg-white/[0.04] p-1 mb-5 border border-white/[0.06]">
                  {(["profile", "manual"] as const).map((m) => (
                    <motion.button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        mode === m
                          ? "bg-gradient-to-r from-cyan-600 to-brand-600 text-white shadow-glow-cyan"
                          : "text-white/35 hover:text-white/60"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      {m === "profile" ? "👤 My Profile" : "✏️ Manual Entry"}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Your skills */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2.5">
                  Your Skills
                </label>
                <AnimatePresence mode="wait">
                  {mode === "profile" && isStudent ? (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] min-h-[80px]"
                    >
                      {profileSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {profileSkills.map((s: string) => (
                            <span key={s} className="skill-tag">{s}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-white/25 text-sm">
                          <span>⚠️</span>
                          <span>No skills in profile. Switch to manual entry.</span>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.textarea
                      key="manual"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="input-glow w-full rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 px-4 py-3 text-sm transition-all duration-200 resize-none"
                      placeholder="Python, Node.js, SQL, React..."
                      rows={3}
                      value={userSkillsInput}
                      onChange={(e) => setUserSkillsInput(e.target.value)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Job skills */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2.5">
                  Job Required Skills
                  <span className="text-white/25 font-normal ml-1 normal-case">(from job description)</span>
                </label>
                <textarea
                  className="input-glow w-full rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 px-4 py-3 text-sm transition-all duration-200 resize-none"
                  placeholder="Python, Machine Learning, TensorFlow, SQL..."
                  rows={4}
                  value={jobSkillsInput}
                  onChange={(e) => setJobSkillsInput(e.target.value)}
                />
                <p className="text-xs text-white/20 mt-1.5">Separate skills with commas or new lines</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-4"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <Button className="w-full" size="lg" variant="secondary" loading={loading} onClick={handleAnalyze}>
                🎯 Check ATS Score
              </Button>
            </GlassCard>
          </motion.div>

          {/* ── Results panel ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <AnimatePresence mode="wait">

              {/* Empty */}
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="text-center py-20 h-full" hover={false}>
                    <motion.div
                      animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <p className="text-7xl mb-5">🎯</p>
                    </motion.div>
                    <p className="text-xl font-bold text-white mb-2">ATS Ready</p>
                    <p className="text-white/35 text-sm max-w-xs mx-auto">
                      Enter the job's required skills and click "Check ATS Score" to see your match
                    </p>
                    <div className="mt-8 flex justify-center gap-4 opacity-20">
                      {["Python", "React", "SQL"].map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Loading */}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="text-center py-20 h-full" hover={false}>
                    <div className="flex flex-col items-center gap-5">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                        <div className="absolute inset-3 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">🎯</div>
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">Analyzing skill match...</p>
                        <p className="text-white/35 text-sm">Comparing against job requirements</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Result */}
              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="space-y-4"
                >
                  {/* Score card */}
                  <GlassCard
                    hover={false}
                    depth="floating"
                    className="relative overflow-hidden"
                    style={{ borderColor: `${scoreColor}25` } as any}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.08]"
                      style={{ background: `radial-gradient(ellipse at 80% 20%, ${scoreColor} 0%, transparent 60%)` }}
                    />
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}60, transparent)` }} />

                    <div className="relative flex items-center gap-6">
                      <ScoreRing score={score} size={120} strokeWidth={10} glowIntensity="high" />
                      <div className="flex-1">
                        <p className="text-xs text-white/30 mb-1 font-mono uppercase tracking-wider">ATS Match Score</p>
                        <p className="text-4xl font-black text-white">{result.atsScore}</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: scoreColor }}>
                          {getScoreLabel(score)} Match
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs text-white/40">{result.matchingSkills.length} matched</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-xs text-white/40">{result.missingSkills.length} missing</span>
                          </div>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${scoreColor}80, ${scoreColor})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Matching skills */}
                  <GlassCard hover={false} glow="green">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                        <span className="text-emerald-400 text-xs">✓</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm">Matching Skills</h3>
                      <Badge variant="success">{result.matchingSkills.length}</Badge>
                    </div>
                    {result.matchingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.matchingSkills.map((s, i) => (
                          <motion.span
                            key={s}
                            className="text-sm px-3 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 font-medium"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            ✓ {s}
                          </motion.span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/25">No skills matched</p>
                    )}
                  </GlassCard>

                  {/* Missing skills */}
                  <GlassCard hover={false}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                        <span className="text-red-400 text-xs">✗</span>
                      </div>
                      <h3 className="font-semibold text-white text-sm">Missing Skills</h3>
                      <Badge variant="danger">{result.missingSkills.length}</Badge>
                    </div>
                    {result.missingSkills.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {result.missingSkills.map((s, i) => (
                            <motion.span
                              key={s}
                              className="text-sm px-3 py-1 rounded-full bg-red-500/12 border border-red-500/25 text-red-400 font-medium"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              ✗ {s}
                            </motion.span>
                          ))}
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                          <span className="text-amber-400 text-sm flex-shrink-0">💡</span>
                          <p className="text-xs text-white/35">
                            Add these skills to your profile to improve your ATS score for this role.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                        <span className="text-emerald-400">🎉</span>
                        <p className="text-sm text-emerald-400 font-medium">You have all required skills!</p>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
