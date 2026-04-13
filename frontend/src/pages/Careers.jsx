import { motion } from "framer-motion";

const ROLES = [
  { title: "Frontend Engineer", blurb: "React, Vite, Tailwind—shipping accessible security UX." },
  { title: "Backend Engineer", blurb: "Flask APIs, threat intel pipelines, scalable scoring services." },
  { title: "Security Analyst", blurb: "Rule tuning, abuse research, and customer-facing investigations." },
];

/** Simple careers landing (static content). */
export default function Careers() {
  return (
    <motion.div
      className="mx-auto max-w-3xl text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Join Our Cybersecurity Team</h1>
      <p className="mt-4 text-slate-400">
        We build practical defenses against phishing and fraud—fast iteration, strong ethics, and real user impact.
      </p>

      <ul className="mt-12 grid gap-4 text-left sm:grid-cols-3">
        {ROLES.map((role, i) => (
          <motion.li
            key={role.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            whileHover={{ y: -4 }}
            className="rounded-xl border border-cyan-500/15 bg-gradient-to-b from-white/[0.07] to-transparent p-5 shadow-[0_0_28px_rgba(34,211,238,0.08)]"
          >
            <h2 className="font-semibold text-cyan-200">{role.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{role.blurb}</p>
          </motion.li>
        ))}
      </ul>

      <p className="mt-10 font-mono text-[11px] text-slate-600">This page is illustrative for the hackathon demo.</p>
    </motion.div>
  );
}
