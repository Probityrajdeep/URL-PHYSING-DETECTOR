import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import ScanWorkspace from "../components/scan/ScanWorkspace.jsx";
import LoginRequiredModal from "../components/LoginRequiredModal.jsx";

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/** Landing: hero copy + primary URL scanner (1 free guest scan). */
export default function HomePage() {
  const { isAuthenticated, guestScanCount, recordScan } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const interceptScan = useCallback(async () => {
    if (!isAuthenticated && guestScanCount >= 1) {
      setLoginModalOpen(true);
      return false;
    }
    return true;
  }, [isAuthenticated, guestScanCount]);

  const onScanSuccess = useCallback(
    (data, url) => {
      recordScan({
        url,
        prediction: data.prediction,
        confidence: data.confidence,
      });
    },
    [recordScan]
  );

  return (
    <>
      <motion.div
        className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12"
        variants={pageVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="max-w-xl flex-1 text-center lg:text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400/90 [text-shadow:0_0_12px_rgba(34,211,238,0.35)]">
            Next-gen defense
          </p>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            AI-Powered{" "}
            <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
              Phishing URL Detector
            </span>
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-400 sm:text-base">
            Paste any link and get an instant, explainable risk assessment powered by Flask heuristics—length, suspicious
            patterns, obfuscation cues, and more. Guests receive one complimentary scan; sign in for unlimited checks and
            dashboard history.
          </p>
          {!isAuthenticated ? (
            <p className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-950/20 px-4 py-2 font-mono text-[11px] text-cyan-200/90">
              Free scans remaining as guest: <span className="font-bold text-white">{Math.max(0, 1 - guestScanCount)}</span>
            </p>
          ) : (
            <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-4 py-2 font-mono text-[11px] text-emerald-200/90">
              Signed in — unlimited scans and history enabled.
            </p>
          )}
        </motion.div>

        <ScanWorkspace interceptScan={interceptScan} onScanSuccess={onScanSuccess} />
      </motion.div>

      <AnimatePresence>
        {loginModalOpen ? <LoginRequiredModal key="guest-limit" onClose={() => setLoginModalOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}
