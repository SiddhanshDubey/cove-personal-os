import { createFileRoute } from "@tanstack/react-router";
import { BatteryMedium, Check, CircleAlert, Clock3, LockKeyhole, Mail, Mic, Radio, Send, Settings2, ShieldCheck, Smartphone, Sparkles, UserRound, Wifi, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { runAgentCommand } from "@/server/agent-fn";

type CoveState = "idle" | "listening" | "thinking" | "executing" | "result" | "confirm" | "success" | "cancelled";
type Panel = "integrations" | "privacy" | "activity" | null;
type AgentRequestState = "idle" | "loading" | "success" | "error";

const activityItems = [
  { time: "Live", label: "Current time tool available", icon: Clock3 },
  { time: "Demo", label: "Email flow is simulated", icon: Mail },
  { time: "—", label: "No external services connected", icon: Wifi },
];

const integrations = [
  { name: "Gmail", state: "Not connected", tone: "text-haze/70", icon: Mail },
  { name: "Contacts", state: "Not connected", tone: "text-haze/70", icon: UserRound },
  { name: "Calendar", state: "Not connected", tone: "text-haze/70", icon: Clock3 },
  { name: "Spotify", state: "Not connected", tone: "text-haze/70", icon: Radio },
  { name: "WhatsApp", state: "Not connected", tone: "text-haze/70", icon: Smartphone },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COVE · Personal Agent" },
      { name: "description", content: "A quiet, voice-first personal agent for your Android home screen." },
      { property: "og:title", content: "COVE · Personal Agent" },
      { property: "og:description", content: "A quiet, voice-first personal agent for your Android home screen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoveHome,
});

function CoveHome() {
  const [booting, setBooting] = useState(true);
  const [state, setState] = useState<CoveState>("idle");
  const [action, setAction] = useState("Ready");
  const [panel, setPanel] = useState<Panel>(null);
  const [time, setTime] = useState("18:42");
  const [agentRequestState, setAgentRequestState] = useState<AgentRequestState>("idle");
  const [agentMessage, setAgentMessage] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const bootTimer = setTimeout(() => setBooting(false), 2300);
    const updateTime = () => setTime(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
    updateTime();
    const clockTimer = setInterval(updateTime, 30_000);
    return () => {
      clearTimeout(bootTimer);
      clearInterval(clockTimer);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    timers.current.push(timer);
  };

  const startDemo = () => {
    if (booting || ["listening", "thinking", "executing", "confirm"].includes(state)) return;
    clearTimers();
    setPanel(null);
    setState("listening");
    setAction("Listening...");
    schedule(() => {
      setState("thinking");
      setAction("Thinking...");
    }, 1100);
    schedule(() => {
      setState("executing");
      setAction("Finding Dad...");
    }, 2200);
    schedule(() => setAction("Checking Gmail..."), 3400);
    schedule(() => {
      setState("result");
      setAction("Dad");
    }, 4700);
  };

  const draftReply = () => {
    clearTimers();
    setState("executing");
    setAction("Drafting reply...");
    schedule(() => {
      setState("confirm");
      setAction("Send this reply?");
    }, 1250);
  };

  const sendReply = () => {
    clearTimers();
    setState("executing");
    setAction("Sending reply...");
    schedule(() => {
      setState("success");
      setAction("Sent.");
    }, 1250);
    schedule(() => {
      setState("idle");
      setAction("Ready");
    }, 3400);
  };

  const cancelReply = () => {
    clearTimers();
    setState("cancelled");
    setAction("Cancelled");
    schedule(() => {
      setState("idle");
      setAction("Ready");
    }, 1300);
  };

  const askForCurrentTime = async () => {
    if (agentRequestState === "loading" || state !== "idle") return;

    setAgentRequestState("loading");
    setAgentMessage("Contacting COVE...");
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await runAgentCommand({
        data: {
          message: "What time is it?",
          ...(timeZone ? { timeZone } : {}),
        },
      });
      setAgentRequestState("success");
      setAgentMessage(response.message);
    } catch {
      setAgentRequestState("error");
      setAgentMessage("COVE could not reach the server. Please try again.");
    }
  };

  if (booting) return <BootSequence />;

  const active = state !== "idle" && state !== "cancelled";
  const canSpeak = state === "idle" || state === "result" || state === "success" || state === "cancelled";

  return (
    <main className="min-h-[100svh] bg-background px-3 py-3 text-foreground sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-[460px] flex-col overflow-hidden rounded-[2.6rem] border border-edge/70 bg-panel shadow-cove sm:min-h-[820px] sm:max-h-[920px] sm:min-h-[calc(100svh-3rem)]">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <AmbientField />
          <header className="relative z-10 flex items-center justify-between px-7 pb-2 pt-5 text-[10px] tracking-[0.2em] text-haze">
            <span>{time}</span>
            <span className="font-display text-[11px] tracking-[0.38em] text-cove-soft">COVE</span>
            <div className="flex items-center gap-2" aria-label="Phone status">
              <Wifi className="size-3 text-cove-soft" aria-hidden="true" />
              <span className="text-haze/70">5G</span>
              <BatteryMedium className="size-3.5 text-haze/80" aria-hidden="true" />
            </div>
          </header>

          <section className="relative z-10 px-7 pt-4" aria-live="polite">
            <p className="text-[10px] uppercase tracking-[0.3em] text-haze/75">Good evening, Siddhansh</p>
            <p className="mt-1 text-[13px] tracking-wide text-foreground/75">{state === "idle" ? "3 things need attention today" : "COVE · personal agent"}</p>
          </section>

          <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8">
            <CoveCore state={state} onActivate={startDemo} />
            <div className="mt-6 flex min-h-[42px] flex-col items-center justify-start gap-2 text-center">
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${active ? "bg-cove shadow-cove-dot" : "bg-cove-soft"}`} />
                <p className="text-[11px] uppercase tracking-[0.3em] text-cove-soft">{action}</p>
              </div>
              {state === "idle" && (
                <>
                  <p className="text-[10px] tracking-[0.18em] text-haze/55">Tap the core to run the email demo</p>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-haze/45">Simulated demo · Gmail is not connected</p>
                </>
              )}
              {(state === "listening" || state === "thinking") && <Waveform />}
              {state === "success" && <p className="text-[10px] tracking-[0.18em] text-success/80">Reply delivered</p>}
            </div>

            {state === "result" && <EmailResult onReply={draftReply} />}
            {state === "confirm" && <ReplyConfirmation onSend={sendReply} onCancel={cancelReply} />}
            {state === "idle" && (
              <LiveTimeCommand
                requestState={agentRequestState}
                message={agentMessage}
                onRequest={askForCurrentTime}
              />
            )}
          </section>

          <div className="relative z-10 px-6 pb-4">
            {canSpeak && (
              <Button
                variant="outline"
                size="icon"
                onClick={startDemo}
                aria-label="Speak to COVE"
                className="mx-auto grid size-14 rounded-full border-cove/45 bg-cove/10 text-cove shadow-cove hover:bg-cove/15 hover:text-cove"
              >
                <Mic className="size-5" aria-hidden="true" />
              </Button>
            )}
          </div>

          <nav className="relative z-10 flex items-center justify-between border-t border-edge/60 px-7 py-4 text-[9px] uppercase tracking-[0.24em] text-haze/55" aria-label="COVE utilities">
            <Button variant="ghost" size="sm" onClick={() => setPanel("integrations")} className="h-auto p-0 text-[9px] uppercase tracking-[0.24em] text-haze/55 hover:bg-transparent hover:text-cove">Integrations</Button>
            <Button variant="ghost" size="sm" onClick={() => setPanel("privacy")} className="h-auto p-0 text-[9px] uppercase tracking-[0.24em] text-haze/55 hover:bg-transparent hover:text-cove">Privacy</Button>
            <Button variant="ghost" size="sm" onClick={() => setPanel("activity")} className="h-auto p-0 text-[9px] uppercase tracking-[0.24em] text-haze/55 hover:bg-transparent hover:text-cove">Activity</Button>
          </nav>

          {panel && <UtilitySheet panel={panel} onClose={() => setPanel(null)} />}
        </div>
      </div>
    </main>
  );
}

function AmbientField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-28 left-1/2 size-80 -translate-x-1/2 rounded-full bg-cove/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 size-96 rounded-full bg-cove-soft/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,color-mix(in_oklab,var(--color-cove)_8%,transparent),transparent_60%)]" />
    </div>
  );
}

function CoveCore({ state, onActivate }: { state: CoveState; onActivate: () => void }) {
  const active = state !== "idle" && state !== "cancelled";
  return (
    <Button
      variant="ghost"
      onClick={onActivate}
      aria-label="Activate COVE"
      className={`group relative grid size-56 place-items-center rounded-full p-0 hover:bg-transparent ${active ? "text-cove" : "text-cove-soft"}`}
    >
      <span className={`cove-ripple absolute inset-0 rounded-full border ${active ? "border-cove/40" : "border-cove/20"}`} />
      <span className="absolute inset-3 rounded-full border border-edge/70" />
      <span className={`cove-spin absolute inset-3 rounded-full ${active ? "opacity-100" : "opacity-70"}`} style={{ background: "conic-gradient(from 0deg, color-mix(in oklab, var(--color-cove) 55%, transparent), transparent 30%, transparent 70%, color-mix(in oklab, var(--color-cove) 25%, transparent))", WebkitMask: "radial-gradient(farthest-side, transparent 62%, #000 63%)", mask: "radial-gradient(farthest-side, transparent 62%, #000 63%)" }} />
      <span className={`cove-pulse absolute inset-10 rounded-full bg-cove/15 blur-2xl ${active ? "shadow-cove-dot" : ""}`} />
      <span className={`cove-pulse relative grid size-24 place-items-center rounded-full border bg-cove/5 ${active ? "border-cove/65 shadow-cove" : "border-cove/40 shadow-cove"}`}>
        <span className="font-display pl-[0.4em] text-lg font-light tracking-[0.4em] text-cove">COVE</span>
      </span>
    </Button>
  );
}

function Waveform() {
  return (
    <div className="flex h-6 items-center gap-1" aria-label="Audio activity">
      {[0.4, 0.7, 1, 0.65, 0.85, 0.45, 0.7, 0.35].map((height, index) => (
        <span key={index} className="waveform-bar h-6 w-0.5 rounded-full bg-cove" style={{ animationDelay: `${index * 80}ms`, transform: `scaleY(${height})` }} />
      ))}
    </div>
  );
}

function LiveTimeCommand({
  requestState,
  message,
  onRequest,
}: {
  requestState: AgentRequestState;
  message: string;
  onRequest: () => void;
}) {
  const isLoading = requestState === "loading";

  return (
    <div className="screen-in mt-7 w-full max-w-[340px] rounded-2xl border border-cove/20 bg-graphite/55 p-4 text-center backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.25em] text-cove-soft">Live agent · current time</p>
      <Button
        variant="outline"
        onClick={onRequest}
        disabled={isLoading}
        className="mt-3 h-9 w-full border-cove/35 bg-cove/10 text-[11px] uppercase tracking-[0.16em] text-cove hover:bg-cove/15 hover:text-cove"
      >
        {isLoading ? "Checking time..." : "Try: What time is it?"}
      </Button>
      {requestState !== "idle" && (
        <p
          className={
            "mt-3 text-[11px] leading-relaxed " +
            (requestState === "error" ? "text-warning" : "text-haze")
          }
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}

function EmailResult({ onReply }: { onReply: () => void }) {
  return (
    <div className="screen-in mt-7 w-full max-w-[340px] rounded-2xl border border-cove/20 bg-graphite/55 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-cove-soft">Email demo · simulated</span>
        <span className="text-[9px] tracking-widest text-haze/60">now</span>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-display text-sm tracking-wide text-foreground">Dad</span>
        <Mail className="size-3.5 text-cove-soft" aria-hidden="true" />
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-haze">“Call me when you're free.”</p>
      <div className="my-3 h-px w-full bg-edge/60" />
      <p className="text-[10px] uppercase tracking-[0.2em] text-haze/70">Demo content · Gmail is not connected</p>
      <Button variant="outline" onClick={onReply} className="mt-4 h-9 w-full border-cove/35 bg-cove/10 text-[11px] uppercase tracking-[0.2em] text-cove hover:bg-cove/15 hover:text-cove">Reply</Button>
    </div>
  );
}

function ReplyConfirmation({ onSend, onCancel }: { onSend: () => void; onCancel: () => void }) {
  return (
    <div className="screen-in mt-7 w-full max-w-[340px] rounded-2xl border border-cove/20 bg-graphite/55 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-cove-soft">Reply · Dad</span>
        <span className="text-[9px] uppercase tracking-widest text-warning/80">Confirm</span>
      </div>
      <p className="mt-4 font-display text-base tracking-wide text-foreground">“I'll call you tonight.”</p>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={onSend} className="h-10 flex-1 border-cove/45 bg-cove/10 text-[11px] uppercase tracking-[0.2em] text-cove hover:bg-cove/15 hover:text-cove"><Send className="size-3.5" aria-hidden="true" />Send</Button>
        <Button variant="outline" onClick={onCancel} className="h-10 flex-1 border-edge bg-panel/40 text-[11px] uppercase tracking-[0.2em] text-haze hover:bg-accent hover:text-foreground"><X className="size-3.5" aria-hidden="true" />Cancel</Button>
      </div>
    </div>
  );
}

function UtilitySheet({ panel, onClose }: { panel: Exclude<Panel, null>; onClose: () => void }) {
  const title = panel === "integrations" ? "Integrations" : panel === "privacy" ? "Privacy" : "Activity";
  return (
    <div className="sheet-in absolute inset-x-0 bottom-0 z-30 max-h-[72%] overflow-y-auto rounded-t-[2rem] border-t border-edge bg-panel/95 px-6 pb-7 pt-4 shadow-2xl backdrop-blur-2xl">
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-edge" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cove-soft">COVE / system</p>
          <h2 className="mt-1 font-display text-xl text-foreground">{title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={`Close ${title}`} className="text-haze hover:bg-accent hover:text-cove"><X className="size-4" /></Button>
      </div>
      {panel === "integrations" && <IntegrationsPanel />}
      {panel === "privacy" && <PrivacyPanel />}
      {panel === "activity" && <ActivityPanel />}
    </div>
  );
}

function IntegrationsPanel() {
  return (
    <div className="mt-6 space-y-1">
      {integrations.map(({ name, state, tone, icon: Icon }) => (
        <div key={name} className="flex items-center justify-between border-b border-edge/45 py-3">
          <div className="flex items-center gap-3"><Icon className="size-4 text-haze/70" aria-hidden="true" /><span className="font-display text-sm text-foreground/90">{name}</span></div>
          <span className={`text-[10px] tracking-wide ${tone}`}>{state}</span>
        </div>
      ))}
      <p className="pt-4 text-[10px] leading-relaxed text-haze/65">No third-party services are connected in this foundation build. COVE never stores service passwords.</p>
    </div>
  );
}

function PrivacyPanel() {
  const permissions = [
    ["Microphone access", "On", ShieldCheck],
    ["Contacts access", "Required", UserRound],
    ["Notifications", "On", Smartphone],
    ["Accessibility service", "Off", Settings2],
    ["Data controls", "On-device", LockKeyhole],
  ] as const;
  return (
    <div className="mt-6 space-y-1">
      {permissions.map(([name, value, Icon]) => (
        <div key={name} className="flex items-center justify-between border-b border-edge/45 py-3">
          <div className="flex items-center gap-3"><Icon className="size-4 text-haze/70" aria-hidden="true" /><span className="font-display text-sm text-foreground/90">{name}</span></div>
          <span className={`text-[10px] tracking-wide ${value === "Required" || value === "Off" ? "text-warning" : "text-cove"}`}>{value}</span>
        </div>
      ))}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-edge/55 bg-graphite/60 p-3"><CircleAlert className="mt-0.5 size-4 shrink-0 text-cove-soft" /><p className="text-[10px] leading-relaxed text-haze/70">Native Android permissions and Accessibility Service will be requested only when a task needs them.</p></div>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div className="mt-6 space-y-3">
      {activityItems.map(({ time, label, icon: Icon }) => (
        <div key={`${time}-${label}`} className="flex items-center gap-3 border-b border-edge/45 pb-3 text-[11px] text-haze/80"><Icon className="size-3.5 text-cove-soft" aria-hidden="true" /><span className="w-10 text-haze/45">{time}</span><span>{label}</span></div>
      ))}
      <p className="pt-2 text-[10px] tracking-wide text-haze/55">Activity stays secondary to the moment.</p>
    </div>
  );
}

function BootSequence() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-background px-6 text-foreground">
      <section className="w-full max-w-[340px]" aria-label="COVE boot sequence">
        <div className="mb-10 flex items-center gap-3"><span className="size-2 rounded-full bg-cove shadow-cove-dot" /><span className="font-display text-2xl tracking-[0.34em] text-cove">COVE</span></div>
        <p className="mb-7 text-[10px] uppercase tracking-[0.32em] text-haze/70">Initializing personal agent</p>
        <div className="space-y-3 border-l border-edge pl-5 text-[10px] tracking-[0.16em] text-haze">
          {[
            { label: "Voice system ........", value: "READY", tone: "text-cove" },
            { label: "Agent route ..........", value: "READY", tone: "text-cove" },
            { label: "Integrations .........", value: "NOT CONNECTED", tone: "text-haze/70" },
            { label: "Home layer ...........", value: "READY", tone: "text-cove" },
          ].map(({ label, value, tone }, index) => (
            <p key={label} className="boot-line" style={{ animationDelay: String(index * 360) + "ms" }}>
              <span className="text-cove-soft">{label} </span>
              <span className={tone}>{value}</span>
            </p>
          ))}
        </div>
        <div className="mt-12 flex items-center gap-2 text-[10px] uppercase tracking-[0.26em] text-cove-soft"><Sparkles className="size-3" aria-hidden="true" /> Good evening.</div>
      </section>
    </main>
  );
}