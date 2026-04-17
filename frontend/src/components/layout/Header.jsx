import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import UserProfileMenu from "./UserProfileMenu.jsx";

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-white/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
  }`;

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 border-b border-white/[0.08] bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onGoBack}
            disabled={location.pathname === "/"}
            aria-label="Go back"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <NavLink to="/" className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/90">
            PhishGuard
          </NavLink>
        </div>

        <nav className="order-3 flex w-full flex-1 justify-center gap-1 sm:order-none sm:w-auto sm:flex-none sm:gap-2 md:gap-4">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/faq" className={navClass}>
            FAQ
          </NavLink>
          <NavLink to="/careers" className={navClass}>
            Careers
          </NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <UserProfileMenu user={user} onLogout={logout} />
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/10"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:brightness-110"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
