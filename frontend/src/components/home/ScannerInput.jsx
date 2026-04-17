import { motion } from "framer-motion";
import ScanWorkspace from "../scan/ScanWorkspace.jsx";

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function ScannerInput({ interceptScan, onScanSuccess }) {
  return (
    <motion.div variants={itemVariants} className="w-full lg:max-w-xl">
      <ScanWorkspace interceptScan={interceptScan} onScanSuccess={onScanSuccess} />
    </motion.div>
  );
}
