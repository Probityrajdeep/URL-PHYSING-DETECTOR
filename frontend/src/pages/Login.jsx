import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { getOAuthAuthorizationUrl } from "../services/authService.js";

function SocialButton({ label, onClick, disabled }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-500/35 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </motion.button>
  );
}

/** Glassmorphism login — mock auth against localStorage users. Social buttons are UI-only. */
export default function Login() {
  const { authenticate, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [redirectingProvider, setRedirectingProvider] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    const res = authenticate(username, password);
    if (!res.ok) {
      setError(res.error || "Login failed.");
      return;
    }
    navigate(from, { replace: true });
  };

  const handleLogin = (provider) => {
    setError("");
    try {
      const authUrl = getOAuthAuthorizationUrl(provider);
      setRedirectingProvider(provider);
      window.location.href = authUrl;
    } catch (authError) {
      setRedirectingProvider("");
      setError(authError?.message || "Failed to start OAuth login.");
    }
  };

  return (
    <motion.div
      className="mx-auto flex max-w-lg flex-col gap-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">PhishGuard</span>
        <Link to="/faq" className="text-xs font-medium text-cyan-300/90 hover:text-cyan-200">
          Help &amp; Support
        </Link>
      </div>

      <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-px shadow-2xl backdrop-blur-2xl">
        <div className="rounded-[15px] bg-black/55 px-6 py-8 sm:px-10 sm:py-10">
          <h1 className="text-center text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-slate-400">Sign in with your registered email and password.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-xs font-medium text-slate-400">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none ring-cyan-500/0 transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none ring-cyan-500/0 transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100"
                role="alert"
              >
                {error}
              </motion.p>
            ) : null}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30"
            >
              Login
            </motion.button>
          </form>

          <div className="mt-8">
            <p className="text-center text-[11px] uppercase tracking-widest text-slate-500">Or continue with</p>
            <div className="mt-3 grid gap-2">
              <SocialButton
                label="Google"
                onClick={() => handleLogin("google")}
                disabled={Boolean(redirectingProvider)}
              />
              <SocialButton
                label="Microsoft"
                onClick={() => handleLogin("microsoft")}
                disabled={Boolean(redirectingProvider)}
              />
              <SocialButton
                label="GitHub"
                onClick={() => handleLogin("github")}
                disabled={Boolean(redirectingProvider)}
              />
            </div>
            {redirectingProvider ? (
              <p className="mt-3 text-center text-xs text-cyan-300">
                Redirecting to {redirectingProvider[0].toUpperCase() + redirectingProvider.slice(1)}...
              </p>
            ) : null}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            No account?{" "}
            <Link to="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
