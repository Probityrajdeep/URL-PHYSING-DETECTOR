import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import LoginRequiredModal from "../components/LoginRequiredModal.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import ScannerInput from "../components/home/ScannerInput.jsx";
import FeatureGrid from "../components/home/FeatureGrid.jsx";
import LiveThreatTicker from "../components/home/LiveThreatTicker.jsx";

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1, delayChildren: 0.05 },
  },
};
const GUEST_SCAN_LIMIT = 1000;

/** Landing: hero copy + primary URL scanner (1 free guest scan). */
export default function HomePage() {
  const { isAuthenticated, guestScanCount, recordScan } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const interceptScan = useCallback(async () => {
    if (!isAuthenticated && guestScanCount >= GUEST_SCAN_LIMIT) {
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
        <HeroSection isAuthenticated={isAuthenticated} guestScanCount={guestScanCount} />
        <div className="w-full lg:max-w-xl">
          <LiveThreatTicker />
          <ScannerInput interceptScan={interceptScan} onScanSuccess={onScanSuccess} />
        </div>
      </motion.div>
      <FeatureGrid />

      <AnimatePresence>
        {loginModalOpen ? <LoginRequiredModal key="guest-limit" onClose={() => setLoginModalOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}
