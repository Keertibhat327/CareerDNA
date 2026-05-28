"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import ScoreRing from "@/components/ui/ScoreRing";

const features = [
  {
    icon: "🧬",
    title: "Career DNA Analysis",
    desc: "AI maps your skills to top career paths with weighted scoring across AIML, Backend, and Data roles.",
    color: "#6366f1",
    glow: "blue" as const,
    tag: "Core Feature",
  },
  {
    icon: "🎯",
    title: "ATS Score Engine",
    desc: "Instantly compare your skills against job requirements. Know exactly what's missing before you apply.",
    color: "#a855f7",
    glow: "purple" as const,
    tag: "Smart Matching",
  },
  {
    icon: "💼",
    title: "Smart Job Board",
    desc: "Browse AI-curated job listings with real-time skill match percentages tailored to your profile.",
    color: "#06b6d4",
    glow: "cyan" as const,
    tag: "Live Data",
  },
  {
    icon: "📊",
    title: "Intelligence Dashboard",
    desc: "Track applications, visualize career progress, and get actionable insights from your data.",
    color: "#10b981",
    glow: "green" as const,
    tag: "Analytics",
  },
];

const stats = [
  { value: "98%", label: "Match Accuracy", icon: "🎯" },
  { value: "10K+", label: "Active Jobs", icon: "💼" },
  { value: "50K+", label: "Candidates", icon: "👥" },
  { value: "4.9★", label: "User Rating", icon: "⭐" },
];

const roles = [
  { name: "AIML Engineer", score: 87, color: "#a855f7" },
  { name: "Backend Dev", score: 72, color: "#6366f1" },
  { name: "Data Analyst", score: 64, color: "#06b6d4" },
];

const steps = [
  {
    step: "01",
    title: "Create your profile",
    desc: "Sign up and add your skills. Our AI immediately starts building your career intelligence profile.",
    icon: "👤",
    color: "#6366f1",
  },
  {
    step: "02",
    title: "Get your DNA score",
    desc: "Receive a detailed breakdown of your fit for top tech roles with actionable gap analysis.",
    icon: "🧬",
    color: "#a855f7",
  },
  {
    step: "03",
    title: "Apply with confidence",
    desc: "Browse matched jobs, check ATS scores, and apply knowing exactly where you stand.",
    icon: "🚀",
    color: "#06b6d4",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  return (
    <div className="overflow-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-16">

        {/* Concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[800, 600, 420, 260].map((size, i) => (
            <motion.div
              key={size}
              className="absolute rounded-full border border-brand-500/[0.06]"
              style={{ width: size, height: size }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear" }}
            />
          ))}
          {/* Glow center */}
          <div className="absolute w-64 h-64 rounded-full bg-brand-600/[0.06] blur-3xl" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 border border-brand-500/25 mb-8 shadow-glow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            <span className="text-sm text-white/60">AI-Powered Career Intelligence Platform</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/25 font-mono">
              v2.0
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.04] mb-6 tracking-tight"
          >
            Decode Your
            <br />
            <span className="gradient-text">Career DNA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered skill analysis, ATS scoring, and intelligent job matching.
            Discover exactly where you stand and what it takes to get there.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/auth/signup">
              <Button size="lg" variant="glow" className="min-w-[180px]">
                <span>🚀</span> Start Free
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" size="lg" className="min-w-[180px]">
                <span>💼</span> Browse Jobs
              </Button>
            </Link>
          </motion.div>

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-2xl mx-auto"
          >
            <GlassCard
              className="neon-border relative overflow-hidden"
              hover={false}
              depth="floating"
              animate={{ y: [0, -10, 0] } as any}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" } as any}
            >
              {/* Scan line */}
              <div className="scan-line" />

              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-white/30 mb-1 font-mono uppercase tracking-wider">Career DNA Analysis</p>
                  <p className="text-lg font-bold text-white">Alex Johnson</p>
                  <p className="text-sm text-white/40">Full Stack Developer</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="glow-dot" />
                    <span className="text-xs text-emerald-400 font-medium">Live Analysis</span>
                  </div>
                  <span className="text-xs text-white/20 font-mono">ID: #A7F2C</span>
                </div>
              </div>

              <div className="flex items-center justify-around py-2">
                {roles.map((role) => (
                  <ScoreRing
                    key={role.name}
                    score={role.score}
                    size={95}
                    strokeWidth={7}
                    label={role.name}
                    animate={false}
                    glowIntensity="high"
                  />
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                {["Python", "Node.js", "SQL", "TensorFlow", "React", "Docker"].map((s) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            </GlassCard>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-5 -right-4 sm:-right-8 glass rounded-2xl px-4 py-3 neon-border-green shadow-glow-green"
            >
              <p className="text-xs text-emerald-400 font-medium mb-0.5">✓ ATS Score</p>
              <p className="text-2xl font-black text-white">92%</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
              className="absolute -bottom-5 -left-4 sm:-left-8 glass rounded-2xl px-4 py-3 neon-border-purple shadow-glow-purple"
            >
              <p className="text-xs text-purple-400 font-medium mb-0.5">🎯 Best Match</p>
              <p className="text-sm font-bold text-white">AIML Engineer</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="py-16 relative">
        <div className="absolute inset-0 border-y border-white/[0.05]" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className="text-center group"
              >
                <motion.p
                  className="text-4xl font-black gradient-text mb-1"
                  whileHover={{ scale: 1.05 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-white/30">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p
              className="text-xs font-mono text-brand-400 mb-4 tracking-[0.2em] uppercase"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Platform Features
            </motion.p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Everything you need to
              <br />
              <span className="gradient-text">land your dream role</span>
            </h2>
            <p className="text-white/35 max-w-xl mx-auto text-lg">
              From skill analysis to application tracking — CareerDNA AI gives you
              the intelligence edge in today's competitive job market.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 150 }}
              >
                <GlassCard glow={f.glow} className="h-full group" tilt>
                  <div className="flex items-start gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        background: `${f.color}15`,
                        border: `1px solid ${f.color}25`,
                        boxShadow: `0 0 24px ${f.color}15, inset 0 1px 0 ${f.color}20`,
                      }}
                      whileHover={{ scale: 1.1, rotate: 8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {f.icon}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{f.title}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}25` }}
                        >
                          {f.tag}
                        </span>
                      </div>
                      <p className="text-white/45 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-mono text-purple-400 mb-4 tracking-[0.2em] uppercase">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">
              Three steps to clarity
            </h2>
          </motion.div>

          <div className="relative space-y-5">
            {/* Connector */}
            <div className="absolute left-[27px] top-14 bottom-14 w-px hidden md:block overflow-hidden">
              <motion.div
                className="w-full h-full"
                style={{ background: "linear-gradient(180deg, #6366f1, #a855f7, #06b6d4)" }}
                initial={{ scaleY: 0, originY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              />
            </div>

            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.18, type: "spring", stiffness: 150 }}
                className="flex gap-5 items-start"
              >
                <motion.div
                  className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`,
                    boxShadow: `0 0 24px ${item.color}15`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item.icon}
                </motion.div>
                <GlassCard className="flex-1" padding="md" hover={false}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-white/20">{item.step}</span>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-white/45 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 150 }}
          >
            <GlassCard className="p-12 neon-border relative overflow-hidden text-center" hover={false} depth="floating">
              {/* Background aurora */}
              <div className="absolute inset-0 bg-aurora opacity-60" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]" />

              <div className="relative">
                <motion.p
                  className="text-6xl mb-6"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  🧬
                </motion.p>
                <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
                  Ready to decode your
                  <br />
                  <span className="gradient-text">career potential?</span>
                </h2>
                <p className="text-white/40 mb-10 max-w-md mx-auto text-lg">
                  Join thousands of professionals using CareerDNA AI to navigate
                  their career with data-driven confidence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signup">
                    <Button size="lg" variant="glow">
                      <span>✨</span> Start for Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="lg">Sign In</Button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-xs">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-semibold text-white/50">CareerDNA AI</span>
          </div>
          <p className="text-xs text-white/20">© 2026 CareerDNA AI. Built with intelligence.</p>
          <div className="flex gap-5 text-xs text-white/25">
            {["Privacy", "Terms", "API"].map((l) => (
              <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
