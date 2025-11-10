import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

type Pref = "system" | "latte" | "mocha";

type ThemePrefContextValue = {
  pref: Pref;
  setPref: (p: Pref) => void;
};

const ThemePrefContext = createContext<ThemePrefContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "theme-pref";

async function getStoredPref(): Promise<Pref | null> {
  try {
    if (Platform.OS === "web") {
      const v =
        typeof localStorage !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (v === "system" || v === "latte" || v === "mocha") return v;
      return null;
    }
    const v = await SecureStore.getItemAsync(STORAGE_KEY);
    if (v === "system" || v === "latte" || v === "mocha") return v;
    return null;
  } catch {
    return null;
  }
}

async function setStoredPref(p: Pref): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined")
        localStorage.setItem(STORAGE_KEY, p);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, p);
  } catch {
    // ignore
  }
}

export function ThemePrefProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<Pref>("system");

  useEffect(() => {
    void (async () => {
      const v = await getStoredPref();
      if (v) setPrefState(v);
    })();
  }, []);

  const setPref = (p: Pref) => {
    setPrefState(p);
    void setStoredPref(p);
  };

  const value = useMemo(() => ({ pref, setPref }), [pref]);

  return (
    <ThemePrefContext.Provider value={value}>
      {children}
    </ThemePrefContext.Provider>
  );
}

export function useThemePref(): ThemePrefContextValue {
  const ctx = useContext(ThemePrefContext);
  if (!ctx)
    throw new Error("useThemePref must be used within ThemePrefProvider");
  return ctx;
}
