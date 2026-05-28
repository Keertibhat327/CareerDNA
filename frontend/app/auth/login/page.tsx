"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import GlassCard from "@/components/ui/GlassCard";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<"student" | "recruiter">("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ ...form, role });
      login(res.token, res.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      {/* Background accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-brand-600/[0.06] blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
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
          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-white/35">Sign in to your account</p>
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
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                icon={<span className="text-sm">✉️</span>}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                icon={<span className="text-sm">🔒</span>}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-2"
                >
                  <span>⚠️</span> {error}
                </motion.div>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Sign In
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-sm text-white/35">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-6"
        >
          {["🔒 Secure", "⚡ Fast", "🧬 AI-Powered"].map((item) => (
            <span key={item} className="text-xs text-white/20">{item}</span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
