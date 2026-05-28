"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getInitials } from "@/lib/utils";
import PageWrapper from "@/components/layout/PageWrapper";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout, isStudent, isRecruiter, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/login");
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  const displayName = isStudent ? (user as any).name : (user as any).companyName;
  const skills: string[] = isStudent ? (user as any).skills || [] : [];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-white">Profile</h1>
          <p className="text-white/35 mt-1">Your CareerDNA AI account</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">

          {/* Profile hero card */}
          <motion.div variants={itemVariants}>
            <GlassCard glow="purple" depth="floating" className="relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.08)_0%,transparent_60%)]" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

              <div className="relative flex items-center gap-5">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-glow-md flex-shrink-0"
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {getInitials(displayName)}
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-white">{displayName}</h2>
                  <p className="text-white/45 text-sm mt-0.5">{user.email}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant={isStudent ? "info" : "purple"}>
                      {isStudent ? "👨‍💻 Student" : "🏢 Recruiter"}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="glow-dot" />
                      <span className="text-xs text-emerald-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Account details */}
          <motion.div variants={itemVariants}>
            <GlassCard hover={false}>
              <h2 className="text-base font-bold text-white mb-4">Account Details</h2>
              <div className="space-y-1">
                {[
                  { label: "Email", value: user.email, icon: "✉️" },
                  { label: "Role", value: user.role, icon: "🎭" },
                  { label: "Account ID", value: `#${user.id.slice(0, 8).toUpperCase()}`, icon: "🔑" },
                  ...(isStudent ? [{ label: "Full Name", value: (user as any).name, icon: "👤" }] : []),
                  ...(isRecruiter ? [{ label: "Company", value: (user as any).companyName, icon: "🏢" }] : []),
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">{item.icon}</span>
                      <span className="text-sm text-white/40">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-white/80 font-mono">{item.value}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Skills */}
          {isStudent && (
            <motion.div variants={itemVariants}>
              <GlassCard glow="blue" hover={false}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">My Skills</h2>
                  <Badge variant="info">{skills.length} skills</Badge>
                </div>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
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
                ) : (
                  <div className="text-center py-6">
                    <p className="text-white/30 text-sm mb-3">No skills added yet</p>
                    <Link href="/score">
                      <Button size="sm" variant="outline">Add Skills via DNA Score</Button>
                    </Link>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* Quick actions */}
          <motion.div variants={itemVariants}>
            <GlassCard hover={false}>
              <h2 className="text-base font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {isStudent && [
                  { icon: "🧬", label: "Career DNA Score", desc: "Analyze your career fit", href: "/score", color: "#6366f1" },
                  { icon: "🎯", label: "ATS Checker", desc: "Check job compatibility", href: "/ats", color: "#06b6d4" },
                  { icon: "💼", label: "Browse Jobs", desc: "Find your next role", href: "/jobs", color: "#a855f7" },
                  { icon: "⚡", label: "Dashboard", desc: "View your overview", href: "/dashboard", color: "#10b981" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all group cursor-pointer"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      style={{ borderColor: `${action.color}00` }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${action.color}12`, border: `1px solid ${action.color}20` }}
                      >
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{action.label}</p>
                        <p className="text-xs text-white/30">{action.desc}</p>
                      </div>
                      <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors">→</span>
                    </motion.div>
                  </Link>
                ))}
                {isRecruiter && [
                  { icon: "➕", label: "Post a Job", desc: "Reach top candidates", href: "/jobs/post", color: "#6366f1" },
                  { icon: "📋", label: "My Listings", desc: "Manage job posts", href: "/jobs", color: "#a855f7" },
                ].map((action) => (
                  <Link key={action.label} href={action.href}>
                    <motion.div
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all group cursor-pointer"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${action.color}12`, border: `1px solid ${action.color}20` }}
                      >
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{action.label}</p>
                        <p className="text-xs text-white/30">{action.desc}</p>
                      </div>
                      <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors">→</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Sign out */}
          <motion.div variants={itemVariants}>
            <GlassCard className="border-red-500/[0.08]" hover={false}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Sign Out</h2>
                  <p className="text-xs text-white/30 mt-0.5">You'll need to sign in again to access your account</p>
                </div>
                <Button variant="danger" onClick={handleLogout} size="sm">
                  🚪 Sign Out
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
