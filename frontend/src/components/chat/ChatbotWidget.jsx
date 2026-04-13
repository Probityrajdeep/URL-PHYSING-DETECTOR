import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MOCK_THREAD = [
  { id: 1, role: "bot", text: "Hi — I’m the PhishGuard assistant (demo). Ask how scanning works or what “Suspicious” means." },
  { id: 2, role: "user", text: "Is this a real AI?" },
  { id: 3, role: "bot", text: "This panel is UI-only for the hackathon. The URL scanner uses your Flask /predict rules + heuristics." },
];

/** Floating support chat — mock conversation, no backend. */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open chat assistant"
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-2xl text-white shadow-[0_0_28px_rgba(59,130,246,0.55)]"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
      >
        {"\uD83D\uDCAC"}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-5 z-[60] flex h-[min(420px,70vh)] w-[min(100vw-2rem,360px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/75 shadow-2xl shadow-black/60 backdrop-blur-2xl"
            role="dialog"
            aria-label="Assistant chat"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-300/90">Assistant</p>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {MOCK_THREAD.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[92%] rounded-xl border px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto border-violet-500/25 bg-violet-950/40 text-slate-100"
                      : "border-cyan-500/20 bg-cyan-950/25 text-slate-200"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 p-3">
              <p className="text-center font-mono text-[10px] text-slate-500">Demo UI — messaging not connected.</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
