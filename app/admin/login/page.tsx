"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { loginAdmin, checkAdminAuth } from "@/lib/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    async function verifyAuth() {
      const isAuth = await checkAdminAuth();
      if (isAuth) {
        router.push("/admin/dashboard");
      }
    }
    verifyAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-maroon/10 shadow-lg p-8 space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted hover:text-maroon transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
        </Link>

        {/* Title */}
        <div className="text-center flex flex-col">
          <span className="font-display text-2xl font-bold text-ink">Trends by Ramya</span>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-gold mt-0.5">
            Admin Control Center
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trendsbyramya.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-maroon/10 focus:border-maroon focus:outline-none text-xs bg-ivory/20"
              />
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-ink-muted/40" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-ink-muted tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-maroon/10 focus:border-maroon focus:outline-none text-xs bg-ivory/20"
              />
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-ink-muted/40" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-full maroon-gradient py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:shadow-md transition-all cursor-pointer mt-6"
          >
            {loading ? "Authenticating..." : "Login to Control Panel"}
          </button>
        </form>

        {/* Mock Mode Reminder Box */}
        <div className="p-4 bg-gold/5 rounded-xl border border-gold/10 text-[10px] text-ink-muted/80 leading-relaxed">
          <span className="font-bold text-gold-light uppercase tracking-wider block mb-1">Local Mock Mode</span>
          If you are running in local mode without Supabase environment variables, use the default admin credentials:<br />
          <span className="font-semibold text-ink">Email:</span> <code className="bg-white/50 px-1 py-0.5 rounded">admin@trendsbyramya.com</code><br />
          <span className="font-semibold text-ink">Password:</span> <code className="bg-white/50 px-1 py-0.5 rounded">adminpassword123</code>
        </div>
      </div>
    </main>
  );
}
