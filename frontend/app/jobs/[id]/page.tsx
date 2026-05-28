"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { jobsApi, scoresApi } from "@/lib/api";
import type { Job, AtsScoreResult } from "@/lib/types";
import { timeAgo, getScoreColor, getScoreLabel, parseScore } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isStudent } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [atsResult, setAtsResult] = useState<AtsScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [atsLoading, setAtsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const jobs = await jobsApi.getAll();
      const found = jobs.find((j) => j.id === id);
      if (!found) { router.push("/jobs"); return; }
      setJob(found);
    } catch {
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      await jobsApi.apply(job.id);
      setApplied(true);
      showToast("Application submitted! 🎉", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to apply", "error");
    } finally {
      setApplying(false);
    }
  };

  const handleAtsCheck = async () => {
    if (!job || !user) return;
    setAtsLoading(true);
    try {
      const result = await scoresApi.atsScore({ jobId: job.id });
      setAtsResult(result);
    } catch (err: any) {
      showToast(err.message || "ATS check failed", "error");
    } finally {
      setAtsLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <div className="h-48 rounded-2xl shimmer-skeleton" />
          <div className="h-64 rounded-2xl shimmer-skeleton" />
        </div>
      </PageWrapper>
    );
  }

  if (!job) return null;

  const userSkills: string[] = isStudent ? (user as any)?.skills || [] : [];
  const atsScore = atsResult ? parseScore(atsResult.atsScore) : null;
  const atsColor = atsScore !== null ? getScoreColor(atsScore) : "#6366f1";

  return (
    <PageWrapper>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-20 left-1/2 z-50 px-5 py-3 rounded-xl border text-sm font-semibold shadow-glass-lg ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                : "bg-red-500/15 border-red-500/35 text-red-300"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
        <Link href="/jobs">
          <Button variant="ghost" size="sm">← Back to Jobs</Button>
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Job header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard glow="blue" depth="floating">
              <div className="flex items-start gap-4 mb-6">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 border border-brand-500/15 flex items-center justify-center text-3xl flex-shrink-0"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  💼
                </motion.div>
                <div className="flex-1">
                  <h1 className="text-2xl font-black text-white mb-1 leading-tight">{job.title}</h1>
                  <p className="text-white/50 font-medium">{job.recruiter.companyName}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <Badge variant="success">Active</Badge>
                    <span className="text-xs text-white/25">Posted {timeAgo(job.createdAt)}</span>
                    <span className="text-xs text-white/25">·</span>
                    <span className="text-xs text-white/25">{job.requiredSkills.length} skills required</span>
                  </div>
                </div>
              </div>

              <div className="divider mb-5" />

              <div>
                <p className="text-xs font-semibold text-white/35 uppercase tracking-wider mb-3">Job Description</p>
                <p className="text-white/60 leading-relaxed whitespace-pre-wrap text-sm">{job.description}</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Required skills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard glow="purple">
              <h2 className="text-base font-bold text-white mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, i) => {
                  const isMatch = userSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
                  return (
                    <motion.span
                      key={skill}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        isMatch && isStudent
                          ? "bg-emerald-500/12 border-emerald-500/25 text-emerald-400"
                          : "bg-white/[0.04] border-white/[0.08] text-white/55"
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {isMatch && isStudent && "✓ "}
                      {skill}
                    </motion.span>
                  );
                })}
              </div>
              {isStudent && userSkills.length > 0 && (
                <p className="text-xs text-white/25 mt-3">✓ = skills you already have</p>
              )}
            </GlassCard>
          </motion.div>

          {/* ATS Result */}
          <AnimatePresence>
            {atsResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard
                  hover={false}
                  depth="floating"
                  style={{ borderColor: `${atsColor}20` } as any}
                >
                  <div
                    className="absolute inset-0 opacity-[0.06] rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at 80% 20%, ${atsColor} 0%, transparent 60%)` }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-base font-bold text-white">ATS Analysis</h2>
                      <Badge variant={atsScore && atsScore >= 60 ? "success" : "warning"}>
                        {getScoreLabel(atsScore || 0)}
                      </Badge>
                    </div>

                    <div className="flex items-start gap-6 mb-5">
                      <ScoreRing score={atsScore || 0} size={100} strokeWidth={8} label="ATS Score" glowIntensity="high" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs text-white/35 mb-2 font-medium uppercase tracking-wider">
                            Matching ({atsResult.matchingSkills.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.matchingSkills.map((s) => (
                              <span key={s} className="text-xs px-2 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-emerald-400">✓ {s}</span>
                            ))}
                            {atsResult.matchingSkills.length === 0 && <span className="text-xs text-white/25">None matched</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-white/35 mb-2 font-medium uppercase tracking-wider">
                            Missing ({atsResult.missingSkills.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResult.missingSkills.map((s) => (
                              <span key={s} className="text-xs px-2 py-1 rounded-full bg-red-500/12 border border-red-500/25 text-red-400">✗ {s}</span>
                            ))}
                            {atsResult.missingSkills.length === 0 && <span className="text-xs text-emerald-400">All skills matched! 🎉</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Apply card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard glow="green" className="sticky top-24" depth="floating">
              <h2 className="text-base font-bold text-white mb-4">Apply for this role</h2>

              {isStudent ? (
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    variant={applied ? "ghost" : "primary"}
                    loading={applying}
                    disabled={applied}
                    onClick={handleApply}
                  >
                    {applied ? "✓ Application Sent" : "Apply Now"}
                  </Button>

                  <Button
                    className="w-full"
                    variant="outline"
                    size="md"
                    loading={atsLoading}
                    onClick={handleAtsCheck}
                  >
                    🎯 Check ATS Score
                  </Button>

                  {userSkills.length === 0 && (
                    <p className="text-xs text-white/25 text-center">Add skills to your profile for ATS analysis</p>
                  )}
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-sm text-white/40 text-center mb-3">Sign in to apply for this job</p>
                  <Link href="/auth/login" className="block">
                    <Button className="w-full" size="lg">Sign In to Apply</Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-white/40 text-center">Recruiters cannot apply for jobs</p>
              )}
            </GlassCard>
          </motion.div>

          {/* Company info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard hover={false}>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Company</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-brand-500/15 border border-purple-500/15 flex items-center justify-center text-lg">
                  🏢
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{job.recruiter.companyName}</p>
                  <p className="text-xs text-white/35">{job.recruiter.email}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Job meta */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard hover={false}>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Details</p>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "Posted", value: timeAgo(job.createdAt) },
                  { label: "Skills required", value: `${job.requiredSkills.length}` },
                  { label: "Status", value: <Badge variant="success">Active</Badge> },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-white/35 text-xs">{item.label}</span>
                    <span className="text-white/70 text-xs font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
