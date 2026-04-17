import { motion } from "framer-motion";
import SettingsTab from "../components/dashboard/SettingsTab.jsx";

export default function AccountSettings() {
  return (
    <motion.div
      className="mx-auto max-w-5xl space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/[0.08] px-4 py-3 text-sm text-cyan-100 backdrop-blur-xl">
        Manage your account profile, API access, alerts, and security actions.
      </div>
      <SettingsTab />
    </motion.div>
  );
}
