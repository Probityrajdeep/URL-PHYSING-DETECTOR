import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ITEMS = [
  {
    q: "What is phishing?",
    a: "Phishing is a social-engineering attack where criminals impersonate trusted brands or colleagues to steal credentials, money, or data—often via deceptive links and urgent messaging.",
  },
  {
    q: "How does this tool work?",
    a: "You submit a URL to the Flask /predict endpoint. A rule-based engine scores features like length, suspicious keywords, unusual characters, “@” tricks, raw IPs, and subdomain depth—then returns Safe, Suspicious, or Phishing with reasons.",
  },
  {
    q: "Is my data safe?",
    a: "This demo stores signups and scan history in your browser (localStorage) only—no production database. Do not use real passwords you reuse elsewhere. In production you would use HTTPS, server-side auth, and strict retention policies.",
  },
];

/** FAQ with animated accordion rows. */
export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <motion.div
      className="mx-auto max-w-2xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <h1 className="text-center text-3xl font-bold text-white sm:text-left">FAQ</h1>
      <p className="mt-2 text-center text-slate-400 sm:text-left">Quick answers about phishing and this scanner.</p>

      <div className="mt-10 space-y-3">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={item.q}
              layout
              className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-glass backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/5"
              >
                {item.q}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-cyan-300" aria-hidden>
                  {"\u25BC"}
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="border-t border-white/5"
                  >
                    <p className="px-5 py-4 text-sm leading-relaxed text-slate-400">{item.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
