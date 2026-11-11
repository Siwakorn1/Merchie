"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { computeHealth, type Health } from "@/lib/health/score";
import { issues as allIssues, type Issue } from "@/lib/content/issues";
import { LOOK_ACCENT, type MascotStyle } from "@/components/mascot/mascot";
import { atLeast, type Plan } from "@/lib/plans";
import type { PlatformId } from "@/components/brand/platform-logo";
import type { ShopDoc } from "@/lib/content/documents";

export type LineSettings = { connected: boolean; morning: boolean; urgent: boolean; time: string };
const LINE_DEFAULT: LineSettings = { connected: false, morning: true, urgent: true, time: "08:00" };
const PLATFORMS_DEFAULT: PlatformId[] = ["shopee"]; // Check up connects one platform

/**
 * Prototype app state. No backend: everything lives in memory and resets on reload,
 * which is what a stage demo wants.
 */
type AppState = {
  /** Demo controls are visible unless the URL has ?demo=0 */
  enabled: boolean;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  /** null = use the computed score */
  override: number | null;
  setOverride: (score: number | null) => void;

  health: Health;
  openIssues: Issue[];
  resolved: string[];
  resolve: (issueId: string) => void;

  /** Demo story step 3: the shop gets suspended */
  suspended: boolean;
  setSuspended: (s: boolean) => void;

  mascotStyle: MascotStyle;
  setMascotStyle: (s: MascotStyle) => void;
  /** FREE / PLUS / PRO. `has("plus")` is true on PLUS and PRO */
  plan: Plan;
  setPlan: (p: Plan) => void;
  has: (need: Plan) => boolean;
  /** start a trial of at least this plan (never downgrades) */
  upgrade: (to: Plan) => void;

  /** connected marketplaces / channels */
  platforms: PlatformId[];
  connect: (id: PlatformId) => void;
  disconnect: (id: PlatformId) => void;

  line: LineSettings;
  setLine: (patch: Partial<LineSettings>) => void;

  /** FREE copy-checker quota used this month */
  scansUsed: number;
  useScan: () => void;

  /** licences the shop added to the Legal Checklist */
  docs: ShopDoc[];
  addDoc: (d: ShopDoc) => void;
  removeDoc: (id: string) => void;

  /** presenter: back to the start of the demo story */
  resetDemo: () => void;
  /** props in Merchie's hands */
  outfit: boolean;
  setOutfit: (o: boolean) => void;
};

const Ctx = createContext<AppState | null>(null);
const noopSubscribe = () => () => {};

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [resolved, setResolved] = useState<string[]>([]);
  const [suspended, setSuspended] = useState(false);
  const [mascotStyle, setMascotStyle] = useState<MascotStyle>("jelly");
  const [outfit, setOutfit] = useState(true);
  const [plan, setPlan] = useState<Plan>("free");
  const has = useCallback((need: Plan) => atLeast(plan, need), [plan]);
  const upgrade = useCallback((to: Plan) => setPlan((p) => (atLeast(p, to) ? p : to)), []);
  const [platforms, setPlatforms] = useState<PlatformId[]>(PLATFORMS_DEFAULT);
  const connect = useCallback((id: PlatformId) => setPlatforms((p) => (p.includes(id) ? p : [...p, id])), []);
  const disconnect = useCallback((id: PlatformId) => setPlatforms((p) => p.filter((x) => x !== id)), []);
  const [line, setLineState] = useState<LineSettings>(LINE_DEFAULT);
  const setLine = useCallback((patch: Partial<LineSettings>) => setLineState((l) => ({ ...l, ...patch })), []);
  const [scansUsed, setScans] = useState(3);
  const [docs, setDocs] = useState<ShopDoc[]>([]);
  const addDoc = useCallback((d: ShopDoc) => setDocs((x) => [...x, d]), []);
  const removeDoc = useCallback((id: string) => setDocs((x) => x.filter((d) => d.id !== id)), []);
  const useScan = useCallback(() => setScans((n) => n + 1), []);
  const resetDemo = useCallback(() => {
    setOverride(null);
    setResolved([]);
    setSuspended(false);
    setMascotStyle("jelly");
    setOutfit(true);
    setPlan("free");
    setPlatforms(PLATFORMS_DEFAULT);
    setLineState(LINE_DEFAULT);
    setScans(3);
    setDocs([]);
  }, []);
  const enabled = useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("demo") !== "0",
    () => false,
  );

  // Merchie's look sets the app accent (blue / green / yellow)
  useEffect(() => {
    document.documentElement.dataset.accent = LOOK_ACCENT[mascotStyle];
  }, [mascotStyle]);

  const health = useMemo(() => computeHealth(resolved), [resolved]);
  const openIssues = useMemo(() => allIssues.filter((i) => !resolved.includes(i.id)), [resolved]);
  const resolve = useCallback(
    (id: string) => setResolved((r) => (r.includes(id) ? r : [...r, id])),
    [],
  );

  return (
    <Ctx.Provider
      value={{
        enabled,
        panelOpen,
        setPanelOpen,
        override,
        setOverride,
        health,
        openIssues,
        resolved,
        resolve,
        suspended,
        setSuspended,
        mascotStyle,
        setMascotStyle,
        outfit,
        setOutfit,
        plan,
        setPlan,
        has,
        upgrade,
        platforms,
        connect,
        disconnect,
        line,
        setLine,
        scansUsed,
        useScan,
        resetDemo,
        docs,
        addDoc,
        removeDoc,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemo must be used inside <DemoProvider>");
  return ctx;
}

/** The score every screen should show: demo override if set, otherwise the computed one. */
export function useShopScore() {
  const { override, health } = useDemo();
  return override ?? health.score;
}
