"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { jobsApi, scoresApi } from "@/lib/api";
import type { Job, CareerScoreResult } from "@/lib/types";
import { parseScore, getScoreColor, ROLE_COLORS, ROLE_ICONS, timeAgo } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import GlassCard from "@/components/ui/GlassCard";
import StatCard from "@/components/ui/StatCard";
import ScoreRing from "@/components/ui/ScoreRing";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

const activityData = [
  { day: "Mon", applications: 2, views: 8 },
  { day: "Tue", applications: 1, views: 12 },
  { day: "Wed", applications: 3, views: 15 },
  { day: "Thu", applications: 0, views: 6 },
  { day: "Fri", applications: 4, views: 20 },
  { day: "Sat", applications: 1, views: 9 },
  { day: "Sun", applications: 2, views: 11 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-3 border border-white/10 text-sm shadow-glass">
      <p className="text-white/50 mb-2 text-xs font-medium uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60 text-xs">{p.name}:</span>
          <span className="font-bold text-white text-xs">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="h-16 rounded-xl shimmer-skeleton border border-white/[0.04]" />
);

export default function DashboardPage() {
  const { user, isStudent, isRecruiter } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scores, setScores] = useState<CareerScoreResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [jobsData] = await Promise.all([jobsApi.getAll()]);
      setJobs(jobsData);
      if (isStudent) {
        try {
          const scoreData = await scoresApi.careerScore();
          setScores(scoreData);
        } catch { /* optional */ }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const displayName = isStudent ? (user as any).name : (user as any).companyName;
  const userSkills: string[] = isStudent ? (user as any).skills || [] : [];

  const scoreEntries = scores
    ? Object.entries(scores.careerDNAScores)
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

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
  };

  return (
    <PageWrapper>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring" }}>
          <p className="text-xs text-white/25 mb-1 font-mono">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Welcome back,{" "}
            <span className="gradient-text">{displayName.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-white/35 mt-1 text-sm">
            {isStudent ? "Here's your career intelligence overview" : "Manage your job listings and candidates"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="flex gap-2 flex-shrink-0"
        >
          {isStudent && (
            <>
              <Link href="/score"><Button variant="outline" size="sm">🧬 DNA Score</Button></Link>
              <Link href="/jobs"><Button size="sm">💼 Browse Jobs</Button></Link>
            </>
          )}
          {isRecruiter && (
            <Link href="/jobs/post"><Button size="sm">+ Post Job</Button></Link>
          )}
        </motion.div>
      </div>

      {/* ── Student Dashboard ─────────────────────────────────────────── */}
      {isStudent && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

          {/* Stat cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Jobs Available" value={loading ? "—" : jobs.length} change="12 new today" trend="up" icon="💼" color="#6366f1" delay={0} />
            <StatCard label="Skills Listed" value={userSkills.length} change="Add more skills" trend="neutral" icon="🎯" color="#a855f7" delay={0.05} />
            <StatCard label="Top Match" value={topRole ? `${topRole.score}%` : "—"} change={topRole?.role || "Run analysis"} trend="up" icon="🧬" color="#10b981" delay={0.1} />
            <StatCard label="Applications" value="0" change="Start applying" trend="neutral" icon="📨" color="#06b6d4" delay={0.15} />
          </motion.div>

          {/* Top match banner */}
          {topRole && (
            <motion.div variants={itemVariants}>
              <GlassCard
                className="relative overflow-hidden"
                hover={false}
                style={{ borderColor: `${topRole.color}25` } as any}
              >
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{ background: `radial-gradient(ellipse at 80% 50%, ${topRole.color} 0%, transparent 60%)` }}
                />
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${topRole.color}50, transparent)` }} />

                <div className="relative flex items-center gap-5">
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{
                      background: `${topRole.color}15`,
                      border: `1px solid ${topRole.color}30`,
                      boxShadow: `0 0 30px ${topRole.color}20`,
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {topRole.icon}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-xs text-white/30 mb-1 font-mono uppercase tracking-wider">Best Career Match</p>
                    <p className="text-2xl font-black text-white">{topRole.role}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: topRole.color }}>
                      {topRole.score}% compatibility · AI-analyzed
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <ScoreRing score={topRole.score} size={80} strokeWidth={6} showLabel={false} glowIntensity="high" />
                  </div>
                  <Link href="/score">
                    <Button variant="outline" size="sm">Full Analysis →</Button>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Charts row */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-5">

            {/* Career DNA bars */}
            <GlassCard className="lg:col-span-1" glow="purple" hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Career DNA</h2>
                <Link href="/score">
                  <Button variant="ghost" size="xs">Analyze →</Button>
                </Link>
              </div>

              {scoreEntries.length > 0 ? (
                <div className="space-y-4">
                  {scoreEntries.map((entry, i) => (
                    <div key={entry.role}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{entry.icon}</span>
                          <span className="text-sm text-white/60">{entry.role}</span>
                        </div>
                        <span className="text-sm font-bold font-mono" style={{ color: entry.color }}>
                          {entry.score}%
                        </span>
                      </div>
                      <div className="progress-track">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${entry.score}%` }}
                          transition={{ duration: 1.4, delay: 0.4 + i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                          className="h-full rounded-full relative"
                          style={{
                            background: `linear-gradient(90deg, ${entry.color}60, ${entry.color})`,
                            boxShadow: `0 0 10px ${entry.color}50`,
                          }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                            style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <motion.p className="text-4xl mb-3" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>🧬</motion.p>
                  <p className="text-white/35 text-sm mb-4">
                    {userSkills.length === 0 ? "Add skills to see your Career DNA" : "Loading analysis..."}
                  </p>
                  <Link href="/score"><Button size="sm" variant="outline">Run Analysis</Button></Link>
                </div>
              )}
            </GlassCard>

            {/* Radar chart */}
            <GlassCard className="lg:col-span-2" glow="blue" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Skill Radar</h2>
                <Badge variant="info">AI Analysis</Badge>
              </div>

              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500 }} />
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2.5} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[240px]">
                  <div className="text-center">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="text-white/30 text-sm">Add skills to see your radar chart</p>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Activity + Score rings */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-5">

            {/* Activity chart */}
            <GlassCard className="lg:col-span-2" glow="cyan" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Weekly Activity</h2>
                <Badge variant="success">This week</Badge>
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2.5} fill="url(#appGrad)" name="Applications" dot={false} />
                  <Area type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={2.5} fill="url(#viewGrad)" name="Job Views" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Score rings */}
            <GlassCard glow="green" hover={false}>
              <h2 className="text-base font-bold text-white mb-4">Role Fit</h2>
              {scoreEntries.length > 0 ? (
                <div className="flex flex-col items-center gap-5">
                  {scoreEntries.slice(0, 3).map((entry) => (
                    <ScoreRing key={entry.role} score={entry.score} size={82} strokeWidth={6} label={entry.role} glowIntensity="medium" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <p className="text-3xl mb-2">🎯</p>
                  <p className="text-white/30 text-sm text-center">Run DNA analysis to see role fit scores</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Recent jobs */}
          <motion.div variants={itemVariants}>
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Recent Jobs</h2>
                <Link href="/jobs"><Button variant="ghost" size="xs">View all →</Button></Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.slice(0, 5).map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link href={`/jobs/${job.id}`}>
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-brand-500/20 transition-all duration-200 group">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 border border-brand-500/15 flex items-center justify-center text-base flex-shrink-0">
                              💼
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{job.title}</p>
                              <p className="text-xs text-white/30">{job.recruiter.companyName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-wrap gap-1">
                              {job.requiredSkills.slice(0, 2).map((s) => (
                                <span key={s} className="skill-tag text-[11px] py-0.5 px-2">{s}</span>
                              ))}
                            </div>
                            <span className="text-xs text-white/20">{timeAgo(job.createdAt)}</span>
                            <span className="text-white/20 group-hover:text-white/50 transition-colors text-sm">→</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* ── Recruiter Dashboard ───────────────────────────────────────── */}
      {isRecruiter && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active Jobs" value={loading ? "—" : jobs.filter(j => j.recruiterId === user.id).length} change="Total posted" trend="neutral" icon="📋" color="#6366f1" delay={0} />
            <StatCard label="Total Jobs" value={loading ? "—" : jobs.length} change="Platform wide" trend="up" icon="💼" color="#a855f7" delay={0.05} />
            <StatCard label="Applications" value="—" change="Coming soon" trend="neutral" icon="📨" color="#10b981" delay={0.1} />
            <StatCard label="Candidates" value="50K+" change="Active users" trend="up" icon="👥" color="#06b6d4" delay={0.15} />
          </motion.div>

          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-5">
            <GlassCard glow="blue" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Application Trends</h2>
                <Badge variant="info">This week</Badge>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={activityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="applications" name="Applications" radius={[5, 5, 0, 0]}>
                    {activityData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${235 + i * 12}, 70%, 62%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard glow="purple" hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Quick Actions</h2>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: "➕", label: "Post a new job", desc: "Reach thousands of candidates", href: "/jobs/post", color: "#6366f1" },
                  { icon: "📋", label: "View my listings", desc: "Manage your job postings", href: "/jobs", color: "#a855f7" },
                  { icon: "👥", label: "Browse candidates", desc: "Find the right talent", href: "/jobs", color: "#06b6d4" },
                ].map((action, i) => (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-brand-500/20 transition-all group cursor-pointer"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}
                      >
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{action.label}</p>
                        <p className="text-xs text-white/30">{action.desc}</p>
                      </div>
                      <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">My Job Listings</h2>
                <Link href="/jobs/post"><Button size="sm">+ Post New</Button></Link>
              </div>
              {loading ? (
                <div className="space-y-3">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div>
              ) : jobs.filter(j => j.recruiterId === user.id).length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-white/40 mb-5">No jobs posted yet</p>
                  <Link href="/jobs/post"><Button>Post your first job</Button></Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.filter(j => j.recruiterId === user.id).map((job, i) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{job.title}</p>
                        <p className="text-xs text-white/30">{timeAgo(job.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex flex-wrap gap-1">
                          {job.requiredSkills.slice(0, 3).map((s) => (
                            <span key={s} className="skill-tag text-[11px] py-0.5 px-2">{s}</span>
                          ))}
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </PageWrapper>
  );
}
