import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Registration with lightweight client-side validation (localStorage-backed). */
export default function Signup() {
  const { registerUser, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const res = registerUser({ name, email, password });
    if (!res.ok) {
      setError(res.error || "Could not create account.");
      return;
    }
    login({ name: name.trim(), email: email.trim() });
    navigate("/dashboard", { replace: true });
  };

  return (
    <motion.div
      className="mx-auto max-w-lg"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-px shadow-2xl backdrop-blur-2xl">
        <div className="rounded-[15px] bg-black/55 px-6 py-8 sm:px-10 sm:py-10">
          <h1 className="text-center text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-center text-sm text-slate-400">Store scan history and unlock unlimited checks.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-400">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30"
                placeholder="Ada Lovelace"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-black/50 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30"
                placeholder="At least 8 characters"
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
              Sign up
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
              Login
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
