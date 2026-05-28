"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { scoresApi } from "@/lib/api";
import type { CareerScoreResult } from "@/lib/types";
import { parseScore, getScoreColor, getScoreLabel, ROLE_COLORS, ROLE_ICONS } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import ScoreRing from "@/components/ui/ScoreRing";
import Badge from "@/components/ui/Badge";

const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "TypeScript", "Node.js", "React", "SQL",
  "PostgreSQL", "MongoDB", "TensorFlow", "PyTorch", "Machine Learning",
  "Deep Learning", "NLP", "Express", "Docker", "AWS", "Pandas", "Tableau",
  "Power BI", "Statistics", "Excel", "Kubernetes", "GraphQL", "Redis",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-3 border border-white/10 text-sm shadow-glass">
      <p className="text-white/40 mb-1 text-xs">{label}</p>
      <p className="font-bold text-white">{payload[0].value}%</p>
    </div>
  );
};

export default function ScorePage() {
  const { user, isStudent } = useAuth();
  const [result, setResult] = useState<CareerScoreResult | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isStudent && user) {
      const userSkills = (user as any).skills || [];
      if (userSkills.length > 0) setSkills(userSkills);
    }
  }, [user, isStudent]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleAnalyze = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await scoresApi.careerScore(skills.length > 0 ? skills : undefined);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreEntries = result
    ? Object.entries(result.careerDNAScores)
        .map(([role, pct]) => ({
          role,
          score: parseScore(pct),
          color: ROLE_COLORS[role] || "#6366f1",
          icon: ROLE_ICONS[role] || "💼",
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  const topRole = scoreEntries[0];
  const radarData = scoreEntries.map((e) => ({
    subject: e.role.split(" ")[0],
    score: e.score,
    fullMark: 100,
  }));

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (s) => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
  ).slice(0, 12);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 border border-brand-500/25 mb-5 shadow-glow-xs"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <span>🧬</span>
            <span className="text-sm text-white/60">AI Career Intelligence</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
            Career <span className="gradient-text">DNA Score</span>
          </h1>
          <p className="text-white/35 max-w-lg mx-auto text-lg">
            Discover your fit for top tech roles. Our AI analyzes your skills against
            industry benchmarks to give you a precise career match score.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Input panel ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: "spring" }}
            className="lg:col-span-2"
          >
            <GlassCard className="sticky top-24" glow="purple" hover={false} depth="floating">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                  <span className="text-sm">🎯</span>
                </div>
                <h2 className="text-base font-bold text-white">Your Skills</h2>
                {skills.length > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                    {skills.length}
                  </span>
                )}
              </div>

              {/* Skill tags */}
              <AnimatePresence>
                {skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex flex-wrap gap-1.5 mb-4"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                className="input-glow w-full rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/25 px-4 py-3 text-sm transition-all duration-200 mb-3"
                placeholder="Add a skill, press Enter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />

              {/* Suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {filteredSuggestions.map((s) => (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/35 hover:text-white/70 hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      + {s}
                    </motion.button>
                  ))}
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-4"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              <Button
                className="w-full"
                size="lg"
                loading={loading}
                onClick={handleAnalyze}
                disabled={skills.length === 0 && !isStudent}
              >
                🧬 Analyze My DNA
              </Button>

              {isStudent && skills.length === 0 && (
                <p className="text-xs text-white/25 text-center mt-2">Will use your profile skills</p>
              )}

              {/* Info */}
              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <p className="text-xs text-white/25 leading-relaxed">
                  Our AI analyzes your skills against industry benchmarks for AIML, Backend, and Data roles using weighted scoring algorithms.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* ── Results panel ───────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            <AnimatePresence mode="wait">

              {/* Empty state */}
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="text-center py-20" hover={false}>
                    <motion.div
                      animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <p className="text-7xl mb-5">🧬</p>
                    </motion.div>
                    <p className="text-xl font-bold text-white mb-2">Ready to analyze</p>
                    <p className="text-white/35 max-w-xs mx-auto">
                      Add your skills and click "Analyze My DNA" to see your career fit scores
                    </p>
                    {/* Decorative rings */}
                    <div className="mt-8 flex justify-center gap-6 opacity-30">
                      {[60, 45, 30].map((s, i) => (
                        <div key={i} className="w-12 h-12 rounded-full border border-brand-500/40" style={{ animationDelay: `${i * 0.5}s` }} />
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Loading */}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GlassCard className="text-center py-20" hover={false}>
                    <div className="flex flex-col items-center gap-5">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
                        <div className="absolute inset-3 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">🧬</div>
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">Analyzing your career DNA...</p>
                        <p className="text-white/35 text-sm">Processing {skills.length} skills against industry benchmarks</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Results */}
              {result && !loading && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* Top match banner */}
                  {topRole && (
                    <GlassCard
                      className="relative overflow-hidden"
                      glow="green"
                      hover={false}
                      depth="floating"
                      style={{ borderColor: `${topRole.color}25` } as any}
                    >
                      <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{ background: `radial-gradient(ellipse at 80% 50%, ${topRole.color} 0%, transparent 60%)` }}
                      />
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${topRole.color}60, transparent)` }} />

                      <div className="relative flex items-center gap-4">
                        <motion.div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                          style={{
                            background: `${topRole.color}15`,
                            border: `1px solid ${topRole.color}30`,
                            boxShadow: `0 0 30px ${topRole.color}20`,
                          }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          {topRole.icon}
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-xs text-white/30 mb-1 font-mono uppercase tracking-wider">Best Career Match</p>
                          <p className="text-2xl font-black text-white">{topRole.role}</p>
                          <p className="text-sm font-medium mt-0.5" style={{ color: topRole.color }}>
                            {getScoreLabel(topRole.score)} fit · {topRole.score}% match
                          </p>
                        </div>
                        <ScoreRing score={topRole.score} size={80} strokeWidth={6} showLabel={false} glowIntensity="high" />
                      </div>
                    </GlassCard>
                  )}

                  {/* Score rings */}
                  <GlassCard hover={false}>
                    <h2 className="text-base font-bold text-white mb-6">Role Fit Scores</h2>
                    <div className="flex justify-around flex-wrap gap-6">
                      {scoreEntries.map((entry, i) => (
                        <motion.div
                          key={entry.role}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.18, type: "spring", stiffness: 200 }}
                        >
                          <ScoreRing score={entry.score} size={115} strokeWidth={8} label={entry.role} glowIntensity="high" />
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Bar chart */}
                  <GlassCard hover={false}>
                    <h2 className="text-base font-bold text-white mb-4">Score Comparison</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={scoreEntries} barSize={44} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="role" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.split(" ")[0]} />
                        <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {scoreEntries.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  {/* Radar */}
                  <GlassCard hover={false}>
                    <h2 className="text-base font-bold text-white mb-4">Skill Radar</h2>
                    <ResponsiveContainer width="100%" height={240}>
                      <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500 }} />
                        <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </GlassCard>

                  {/* Analyzed skills */}
                  <GlassCard hover={false}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-white">Analyzed Skills</h2>
                      <Badge variant="info">{result.normalizedSkills.length} skills</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.normalizedSkills.map((s, i) => (
                        <motion.span
                          key={s}
                          className="skill-tag"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
