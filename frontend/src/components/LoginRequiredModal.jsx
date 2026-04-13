import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/** Modal shown when a guest exceeds the free scan allowance (mount inside AnimatePresence). */
export default function LoginRequiredModal({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="presentation"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-md rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-slate-900/95 to-black/95 p-6 shadow-[0_0_48px_rgba(34,211,238,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="login-required-title" className="text-lg font-semibold text-white">
          Please login to continue scanning
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Your free guest scan is used. Create an account or sign in to run unlimited scans and keep history on the
          dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/login"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
          >
            Login
          </Link>
          <Link
            to="/signup"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-white/10"
          >
            Sign up
          </Link>
        </div>
        <button type="button" className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-300" onClick={onClose}>
          Continue browsing
        </button>
      </motion.div>
    </motion.div>
  );
}
