"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { jobsApi } from "@/lib/api";
import type { Job } from "@/lib/types";
import { timeAgo, parseScore, getScoreColor } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

const SkeletonJobCard = () => (
  <div className="h-52 rounded-2xl shimmer-skeleton border border-white/[0.04]" />
);

export default function JobsPage() {
  const { user, isStudent, isRecruiter } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const data = await jobsApi.getAll();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApply = async (jobId: string) => {
    if (!user) return;
    setApplying(jobId);
    try {
      await jobsApi.apply(jobId);
      setApplied((prev) => new Set(Array.from(prev).concat(jobId)));
      showToast("Application submitted successfully! 🎉", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to apply", "error");
    } finally {
      setApplying(null);
    }
  };

  const userSkills: string[] = isStudent ? (user as any)?.skills || [] : [];

  const getMatchScore = (requiredSkills: string[]): number => {
    if (!userSkills.length || !requiredSkills.length) return 0;
    const userSet = new Set(userSkills.map((s) => s.toLowerCase().trim()));
    const matched = requiredSkills.filter((s) => userSet.has(s.toLowerCase().trim()));
    return Math.round((matched.length / requiredSkills.length) * 100);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.recruiter.companyName.toLowerCase().includes(search.toLowerCase());
      const matchesSkill =
        !skillFilter ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()));
      return matchesSearch && matchesSkill;
    });
  }, [jobs, search, skillFilter]);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => j.requiredSkills.forEach((s) => set.add(s)));
    return Array.from(set).slice(0, 14);
  }, [jobs]);

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring" }}>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {isRecruiter ? "Job Listings" : "Find Your Next Role"}
          </h1>
          <p className="text-white/35 mt-1 text-sm">
            {loading ? "Loading..." : `${filteredJobs.length} opportunities available`}
          </p>
        </motion.div>
        {isRecruiter && (
          <Link href="/jobs/post">
            <Button>+ Post a Job</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-3"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Search jobs or companies..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<span className="text-sm">🔍</span>} />
          <Input placeholder="Filter by skill..." value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} icon={<span className="text-sm">🎯</span>} />
        </div>

        {/* Quick skill filters */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => setSkillFilter("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
              !skillFilter
                ? "bg-brand-500/15 border-brand-500/35 text-brand-300"
                : "bg-white/[0.04] border-white/[0.08] text-white/35 hover:text-white/60"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All Skills
          </motion.button>
          {allSkills.map((skill) => (
            <motion.button
              key={skill}
              onClick={() => setSkillFilter(skillFilter === skill ? "" : skill)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                skillFilter === skill
                  ? "bg-brand-500/15 border-brand-500/35 text-brand-300"
                  : "bg-white/[0.04] border-white/[0.08] text-white/35 hover:text-white/60"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {skill}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Job grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonJobCard key={i} />)}
        </div>
      ) : filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24"
        >
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-xl font-bold text-white mb-2">No jobs found</p>
          <p className="text-white/35">Try adjusting your search filters</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredJobs.map((job, i) => {
              const matchScore = getMatchScore(job.requiredSkills);
              const scoreColor = getScoreColor(matchScore);
              const isApplied = applied.has(job.id);

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
                >
                  <GlassCard className="h-full group" glow="blue" tilt>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/15 to-purple-500/15 border border-brand-500/15 flex items-center justify-center text-2xl flex-shrink-0"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          💼
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-white/90 group-hover:text-white transition-colors leading-tight">
                            {job.title}
                          </h3>
                          <p className="text-sm text-white/40 mt-0.5">{job.recruiter.companyName}</p>
                        </div>
                      </div>

                      {isStudent && matchScore > 0 && (
                        <motion.div
                          className="flex flex-col items-center px-3 py-2 rounded-xl border flex-shrink-0"
                          style={{ background: `${scoreColor}10`, borderColor: `${scoreColor}25` }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.04 + 0.2 }}
                        >
                          <span className="text-lg font-black leading-none" style={{ color: scoreColor }}>{matchScore}%</span>
                          <span className="text-[10px] font-medium mt-0.5" style={{ color: scoreColor }}>match</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/40 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.requiredSkills.map((skill) => {
                        const isMatch = userSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
                        return (
                          <span
                            key={skill}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                              isMatch && isStudent
                                ? "bg-emerald-500/12 border-emerald-500/25 text-emerald-400"
                                : "bg-white/[0.04] border-white/[0.08] text-white/40"
                            }`}
                          >
                            {isMatch && isStudent && "✓ "}
                            {skill}
                          </span>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                      <span className="text-xs text-white/25">{timeAgo(job.createdAt)}</span>
                      <div className="flex gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        {isStudent && (
                          <Button
                            size="sm"
                            variant={isApplied ? "ghost" : "primary"}
                            loading={applying === job.id}
                            disabled={isApplied}
                            onClick={() => handleApply(job.id)}
                          >
                            {isApplied ? "✓ Applied" : "Apply Now"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  );
}
