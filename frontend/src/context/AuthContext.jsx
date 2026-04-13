import { createContext, useCallback, useContext, useMemo, useState } from "react";

const USER_KEY = "phish_session_user";
const USERS_KEY = "phish_registered_users";
const GUEST_SCANS_KEY = "phish_guest_scan_count";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function historyStorageKey(email) {
  return `phish_scan_history_${email}`;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(USER_KEY, null));
  const [scanHistory, setScanHistory] = useState(() => {
    const u = readJson(USER_KEY, null);
    if (!u?.email) return [];
    return readJson(historyStorageKey(u.email), []);
  });
  const [guestScanCount, setGuestScanCount] = useState(() => {
    const n = Number(localStorage.getItem(GUEST_SCANS_KEY) || "0");
    return Number.isFinite(n) ? n : 0;
  });

  const login = useCallback((sessionUser) => {
    setUser(sessionUser);
    writeJson(USER_KEY, sessionUser);
    setScanHistory(readJson(historyStorageKey(sessionUser.email), []));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    setScanHistory([]);
  }, []);

  const registerUser = useCallback((record) => {
    const users = readJson(USERS_KEY, {});
    const key = record.email.trim().toLowerCase();
    if (users[key]) {
      return { ok: false, error: "An account with this email already exists." };
    }
    users[key] = {
      name: record.name.trim(),
      email: record.email.trim(),
      password: record.password,
    };
    writeJson(USERS_KEY, users);
    return { ok: true };
  }, []);

  const authenticate = useCallback((usernameOrEmail, password) => {
    const id = String(usernameOrEmail || "").trim().toLowerCase();
    if (!id || !password) {
      return { ok: false, error: "Enter username and password." };
    }
    const users = readJson(USERS_KEY, {});
    const values = Object.values(users);
    const found =
      users[id] ||
      values.find((u) => String(u.email).toLowerCase() === id) ||
      values.find((u) => String(u.name).toLowerCase() === id);
    if (!found || found.password !== password) {
      return { ok: false, error: "Invalid username or password." };
    }
    login({ name: found.name, email: found.email });
    return { ok: true };
  }, [login]);

  const recordScan = useCallback((entry) => {
    const row = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      url: entry.url,
      prediction: entry.prediction,
      confidence: entry.confidence,
      at: new Date().toISOString(),
    };
    if (user?.email) {
      setScanHistory((prev) => {
        const next = [row, ...prev].slice(0, 100);
        writeJson(historyStorageKey(user.email), next);
        return next;
      });
    } else {
      setGuestScanCount((prev) => {
        const next = prev + 1;
        localStorage.setItem(GUEST_SCANS_KEY, String(next));
        return next;
      });
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      scanHistory,
      guestScanCount,
      login,
      logout,
      registerUser,
      authenticate,
      recordScan,
    }),
    [user, scanHistory, guestScanCount, login, logout, registerUser, authenticate, recordScan]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
