"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { cn, getInitials } from "@/lib/utils";
import Button from "@/components/ui/Button";

const studentNav = [
  { label: "Dashboard", href: "/dashboard", icon: "⚡" },
  { label: "Jobs",      href: "/jobs",      icon: "💼" },
  { label: "DNA Score", href: "/score",     icon: "🧬" },
  { label: "ATS Check", href: "/ats",       icon: "🎯" },
];

const recruiterNav = [
  { label: "Dashboard",   href: "/dashboard", icon: "⚡" },
  { label: "Post Job",    href: "/jobs/post",  icon: "➕" },
  { label: "My Listings", href: "/jobs",       icon: "📋" },
];

export default function Navbar() {
  const { user, logout, isStudent, isRecruiter } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const navItems = isStudent ? studentNav : isRecruiter ? recruiterNav : [];
  const displayName = user
    ? isStudent ? (user as any).name : (user as any).companyName
    : "";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "glass-strong border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group flex-shrink-0">
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-white font-black text-sm">C</span>
              </motion.div>
              <span className="font-bold text-white text-sm">
                Career<span className="gradient-text">DNA</span>
                <span className="text-white/30 text-xs ml-1 font-normal">AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            {user && (
              <div className="hidden md:flex items-center gap-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        className={cn(
                          "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                          isActive
                            ? "text-white"
                            : "text-white/50 hover:text-white/80"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-xl bg-brand-500/15 border border-brand-500/25"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative text-xs">{item.icon}</span>
                        <span className="relative">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-glow-xs">
                      {getInitials(displayName)}
                    </div>
                    <span className="text-sm text-white/70 hidden sm:block max-w-[110px] truncate">
                      {displayName.split(" ")[0]}
                    </span>
                    <motion.svg
                      className="w-3.5 h-3.5 text-white/30"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      animate={{ rotate: profileOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.94 }}
                          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl border border-white/[0.1] shadow-glass-lg overflow-hidden z-20"
                        >
                          {/* Header */}
                          <div className="p-4 border-b border-white/[0.07]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-glow-xs">
                                {getInitials(displayName)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                                <p className="text-xs text-white/40 truncate">{user.email}</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/25">
                                {user.role}
                              </span>
                            </div>
                          </div>

                          {/* Menu items */}
                          <div className="p-1.5">
                            <Link href="/profile" onClick={() => setProfileOpen(false)}>
                              <motion.div
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                                whileHover={{ x: 2 }}
                              >
                                <span className="text-base">👤</span>
                                <span>View Profile</span>
                              </motion.div>
                            </Link>
                            {isStudent && (
                              <Link href="/score" onClick={() => setProfileOpen(false)}>
                                <motion.div
                                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                                  whileHover={{ x: 2 }}
                                >
                                  <span className="text-base">🧬</span>
                                  <span>DNA Score</span>
                                </motion.div>
                              </Link>
                            )}
                            <div className="my-1 h-px bg-white/[0.06]" />
                            <motion.button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.08] transition-all"
                              whileHover={{ x: 2 }}
                            >
                              <span className="text-base">🚪</span>
                              <span>Sign out</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}

              {/* Mobile toggle */}
              {user && (
                <motion.button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden glass rounded-xl p-2 border border-white/[0.08]"
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.svg
                    className="w-5 h-5 text-white/70"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    animate={{ rotate: mobileOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mobileOpen
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    }
                  </motion.svg>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden glass-strong border-t border-white/[0.07] overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        pathname === item.href
                          ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                          : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
