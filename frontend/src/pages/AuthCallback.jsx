import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthCallback() {
  const { search } = useLocation();

  const { code, error, errorDescription } = useMemo(() => {
    const params = new URLSearchParams(search);
    return {
      code: params.get("code"),
      error: params.get("error"),
      errorDescription: params.get("error_description"),
    };
  }, [search]);

  const isAccessDenied = error === "access_denied";
  const hasError = Boolean(error) || !code;

  return (
    <motion.div
      className="mx-auto max-w-2xl rounded-2xl border border-white/15 bg-black/55 p-8 backdrop-blur-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-white">{hasError ? "Login failed" : "Login successful"}</h1>

      {hasError ? (
        <p className="mt-3 rounded-lg border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {isAccessDenied
            ? "Access was denied. Please allow permission and try again."
            : errorDescription || error || "No authorization code was returned."}
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-300">Authorization code:</p>
          <code className="block overflow-x-auto rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            {code}
          </code>
        </div>
      )}

      <div className="mt-6">
        <Link to="/login" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
