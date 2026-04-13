import { useMemo } from "react";
import { motion } from "framer-motion";

function prng(i, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Ambient grid, scanline, particles, and gradient orbs (full-viewport). */
export default function CyberBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        id: i,
        left: `${prng(i, 1) * 100}%`,
        top: `${prng(i, 2) * 100}%`,
        size: 1 + prng(i, 3) * 2.5,
        duration: 14 + prng(i, 4) * 32,
        delay: prng(i, 5) * 10,
        drift: (prng(i, 6) - 0.5) * 50,
        violet: prng(i, 7) > 0.78,
      })),
    []
  );

  return (
    <>
      <div className="cyber-grid pointer-events-none absolute inset-0 z-0 opacity-100" aria-hidden />
      <div className="cyber-scanline pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={
              p.violet
                ? "absolute rounded-full bg-violet-400/35 shadow-[0_0_10px_rgba(167,139,250,0.65)]"
                : "absolute rounded-full bg-cyan-400/45 shadow-[0_0_8px_rgba(34,211,238,0.75)]"
            }
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              opacity: [0.12, 0.5, 0.12],
              y: [0, -24, 0],
              x: [0, p.drift * 0.25, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 rounded-full bg-blue-600/14 blur-[100px]"
        animate={{ opacity: [0.5, 0.88, 0.5], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-80 w-80 rounded-full bg-violet-600/18 blur-[90px]"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
