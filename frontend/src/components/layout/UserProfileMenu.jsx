import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut, Settings, User } from "lucide-react";

const panelAnimation = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.16, ease: "easeInOut" },
  },
};

export default function UserProfileMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const displayName = user?.name || user?.email || "User";
  const subtitle = user?.email || "No email available";

  const initials = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.trim() || "U";
    const [first, second] = source.split(/\s+/);
    const combined = `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
    return combined || source[0].toUpperCase();
  }, [user?.name, user?.email]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuItems = [
    { label: "My Profile", icon: User, to: "/account-settings" },
    { label: "Account Settings", icon: Settings, to: "/account-settings" },
    { label: "API Keys", icon: KeyRound, to: "/account-settings#api-access" },
  ];

  return (
    <div ref={rootRef} className="relative z-40">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 transition hover:bg-white/[0.08]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-500/70 via-blue-500/70 to-violet-500/80 text-xs font-bold text-white shadow-[0_0_16px_rgba(59,130,246,0.45)]">
          {initials}
        </span>
        <span className="hidden max-w-[160px] truncate text-xs font-medium text-slate-200 sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-300 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelAnimation}
            className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-2 shadow-[0_18px_48px_rgba(6,182,212,0.18)] backdrop-blur-xl"
          >
            <div className="px-2 py-2">
              <p className="truncate text-sm font-semibold text-slate-100">{displayName}</p>
              <p className="truncate text-xs text-slate-400">{subtitle}</p>
            </div>

            <div className="my-1 h-px bg-white/10" />

            <div className="py-1">
              {menuItems.map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-200 transition hover:bg-cyan-500/10 hover:text-cyan-100"
                >
                  <Icon className="h-4 w-4 text-cyan-300/90" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="my-1 h-px bg-white/10" />

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-rose-200 transition hover:bg-rose-500/15 hover:text-rose-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
