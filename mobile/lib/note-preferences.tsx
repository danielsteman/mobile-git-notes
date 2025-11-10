import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export type RepoPref = {
  owner: string;
  name: string;
  fullName: string;
};

export type NotePreferences = {
  repo: RepoPref | null;
  folder: string | null; // normalized, e.g. "notes/"
};

type Ctx = {
  prefs: NotePreferences;
  setRepo: (repo: RepoPref | null) => Promise<void>;
  setFolder: (folder: string | null) => Promise<void>;
  isReady: boolean;
};

const STORAGE_KEY = "note-preferences";

async function loadPrefs(): Promise<NotePreferences | null> {
  try {
    if (Platform.OS === "web") {
      const v =
        typeof localStorage !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      return v ? (JSON.parse(v) as NotePreferences) : null;
    }
    const v = await SecureStore.getItemAsync(STORAGE_KEY);
    return v ? (JSON.parse(v) as NotePreferences) : null;
  } catch {
    return null;
  }
}

async function savePrefs(p: NotePreferences): Promise<void> {
  const str = JSON.stringify(p);
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined")
        localStorage.setItem(STORAGE_KEY, str);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, str);
  } catch {
    // ignore
  }
}

function normalizeFolder(input: string): string {
  let v = input.trim();
  if (!v) return "notes/";
  // remove leading slash
  if (v.startsWith("/")) v = v.slice(1);
  // ensure trailing slash
  if (!v.endsWith("/")) v = `${v}/`;
  return v;
}

const NotePrefContext = createContext<Ctx | undefined>(undefined);

export function NotePrefProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<NotePreferences>({
    repo: null,
    folder: null,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const v = await loadPrefs();
      if (v) setPrefs(v);
      setReady(true);
    })();
  }, []);

  const setRepo = useCallback(async (repo: RepoPref | null) => {
    setPrefs((prev) => {
      const next = { ...prev, repo };
      void savePrefs(next);
      return next;
    });
  }, []);

  const setFolder = useCallback(async (folder: string | null) => {
    const normalized = folder ? normalizeFolder(folder) : null;
    setPrefs((prev) => {
      const next = { ...prev, folder: normalized };
      void savePrefs(next);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      prefs,
      setRepo,
      setFolder,
      isReady: ready,
    }),
    [prefs, setRepo, setFolder, ready]
  );

  return (
    <NotePrefContext.Provider value={value}>
      {children}
    </NotePrefContext.Provider>
  );
}

export function useNotePrefs(): Ctx {
  const ctx = useContext(NotePrefContext);
  if (!ctx)
    throw new Error("useNotePrefs must be used within NotePrefProvider");
  return ctx;
}

export { normalizeFolder };
