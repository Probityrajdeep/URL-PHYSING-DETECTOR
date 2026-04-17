import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Heuristic Analysis",
    text: "Flags obfuscation, suspicious tokens, and deceptive domain patterns in milliseconds.",
    accent: "from-cyan-500/20 to-blue-500/10",
  },
  {
    title: "Explainable Verdicts",
    text: "Every result includes a confidence score and transparent reason trail for quick triage.",
    accent: "from-violet-500/20 to-indigo-500/10",
  },
  {
    title: "Live Monitoring UX",
    text: "Cyber dashboard visuals, neon highlights, and animated threat feed mimic SOC tooling.",
    accent: "from-blue-500/20 to-cyan-500/10",
  },
];

export default function FeatureGrid() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.45 }}
      className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {FEATURES.map((feature) => (
        <article
          key={feature.title}
          className={`rounded-xl border border-cyan-500/15 bg-gradient-to-br ${feature.accent} p-5 shadow-[0_0_24px_rgba(34,211,238,0.08)]`}
        >
          <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-300">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.text}</p>
        </article>
      ))}
    </motion.section>
  );
}
