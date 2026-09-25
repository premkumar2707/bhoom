/**
 * BHOO-MITRA AI — Multi-Source Comparison Workspace
 * Route: /harmonization
 *
 * Prompt 5 — Multi-source parcel comparison:
 * ONE PROPERTY → MULTIPLE SOURCES → DIFFERENT REPRESENTATIONS → COMPARISON
 *
 * ⚠️ SYNTHETIC DEMO DATA — NOT REAL GOVERNMENT RECORDS ⚠️
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import {
  Search,
  RotateCcw,
  Play,
  Layers,
  GitCompare,
  Sliders,
  Eye,
  EyeOff,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  BarChart3,
  Calendar,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/common/ModulePage";
import { DemoDataNotice } from "@/components/common/TrustBadge";
import { GlassPanel, StatusBadge, ConfidenceIndicator } from "@/components/ui/bhumitra";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SingleSourceMap,
  OverlayMap,
  DifferenceMap,
} from "@/components/maps/ComparisonMapEngine";
import {
  SOURCE_OBSERVATIONS,
  DEMO_PARCEL,
  ENTITY_MATCH_CONFIDENCE,
  GEOMETRY_COMPARISONS,
  ATTRIBUTE_COMPARISONS,
  TEMPORAL_EVENTS,
  CONFLICT_SUMMARY,
  SEARCHABLE_ENTITIES,
  type SourceId,
  type ComparisonMode,
} from "@/lib/mock/comparison-data";

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/_app/harmonization")({
  head: () => ({
    meta: [
      { title: "Multi-Source Comparison — BHOO-MITRA AI" },
      {
        name: "description",
        content:
          "Compare one property across multiple cadastral sources — Municipal GIS, Property Registry, Survey — side-by-side, overlay, and difference modes.",
      },
      { property: "og:title", content: "Multi-Source Comparison — BHOO-MITRA AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparisonWorkspace,
});

// ---------------------------------------------------------------------------
// Workflow Progress Indicator
// ---------------------------------------------------------------------------

const WORKFLOW_STEPS = [
  { num: "01", label: "IDENTIFY" },
  { num: "02", label: "COMPARE" },
  { num: "03", label: "DETECT" },
  { num: "04", label: "EXPLAIN" },
  { num: "05", label: "VERIFY" },
] as const;

function WorkflowProgress({ active }: { active: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-slim pb-1">
      {WORKFLOW_STEPS.map((step, idx) => (
        <div key={step.num} className="flex items-center gap-1">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 whitespace-nowrap transition-all",
              idx === active
                ? "border-primary bg-primary/15 shadow-[0_0_12px_-4px_var(--primary)]"
                : idx < active
                  ? "border-verified/40 bg-verified/5"
                  : "border-border/40 opacity-50",
            )}
          >
            <span
              className={cn(
                "font-mono text-[10px] font-bold",
                idx === active ? "text-primary" : idx < active ? "text-verified" : "text-muted-foreground",
              )}
            >
              {step.num}
            </span>
            <span
              className={cn(
                "font-mono text-[10px] font-semibold uppercase tracking-widest",
                idx === active ? "text-ivory" : idx < active ? "text-verified/80" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < WORKFLOW_STEPS.length - 1 && (
            <ChevronRight className="size-3 shrink-0 text-muted-foreground/40" />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entity Search Bar
// ---------------------------------------------------------------------------

interface EntitySearchProps {
  onSelect: (entityId: string) => void;
  selectedId: string | null;
}

function EntitySearch({ onSelect, selectedId }: EntitySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = SEARCHABLE_ENTITIES.filter(
    (e) =>
      !query ||
      e.parcelId.toLowerCase().includes(query.toLowerCase()) ||
      e.surveyRef.toLowerCase().includes(query.toLowerCase()) ||
      e.entityId.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          id="entity-search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search Parcel ID, Survey Reference, Entity ID…"
          className="h-8 w-full bg-transparent text-sm text-ivory outline-none placeholder:text-muted-foreground"
        />
        {selectedId && (
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">
            {selectedId}
          </span>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          {filtered.map((e) => (
            <button
              key={e.id}
              onMouseDown={() => { onSelect(e.id); setQuery(""); setOpen(false); }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs hover:bg-primary/10 transition-colors"
            >
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <div>
                <p className="font-mono font-semibold text-ivory">{e.parcelId}</p>
                <p className="mt-0.5 text-muted-foreground">
                  {e.surveyRef} · {e.entityId} · {e.type}
                </p>
              </div>
              {e.isDemo && (
                <span className="ml-auto shrink-0 rounded-full bg-saffron/15 px-1.5 py-0.5 font-mono text-[9px] text-saffron">
                  DEMO
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Source Card
// ---------------------------------------------------------------------------

interface SourceCardProps {
  sourceId: SourceId;
  active: boolean;
  onClick: () => void;
}

function SourceCard({ sourceId, active, onClick }: SourceCardProps) {
  const src = SOURCE_OBSERVATIONS[sourceId];
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col rounded-xl border p-3 text-left transition-all",
        active
          ? "border-primary/60 bg-primary/8 shadow-[0_0_16px_-6px_var(--primary)]"
          : "border-border hover:border-primary/30 hover:bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="h-2.5 w-2.5 mt-0.5 shrink-0 rounded-full border-2"
          style={{
            backgroundColor: active ? src.color : "transparent",
            borderColor: src.color,
          }}
        />
        <StatusBadge label={src.status} variant={src.status === "ACTIVE" ? "verified" : "muted"} />
      </div>
      <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ivory">
        {src.label}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{src.sourceType}</p>
      <div className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
        <div className="flex justify-between">
          <span>Updated</span>
          <span className="font-mono text-ivory">{src.lastUpdated}</span>
        </div>
        <div className="flex justify-between">
          <span>Confidence</span>
          <span className="font-mono" style={{ color: src.color }}>{src.confidence}%</span>
        </div>
      </div>
      {active && (
        <div className="mt-2 h-0.5 w-full rounded-full" style={{ backgroundColor: src.color }} />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Mode Tab Bar
// ---------------------------------------------------------------------------

const MODE_TABS: { id: ComparisonMode; label: string; icon: typeof GitCompare }[] = [
  { id: "side-by-side", label: "Side-by-Side", icon: Layers },
  { id: "overlay", label: "Overlay", icon: Sliders },
  { id: "difference", label: "Difference", icon: GitCompare },
];

function ModeTabBar({ active, onChange }: { active: ComparisonMode; onChange: (m: ComparisonMode) => void }) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
      {MODE_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all",
            active === id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5",
          )}
        >
          <Icon className="size-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Opacity Slider Row
// ---------------------------------------------------------------------------

function OpacityRow({
  sourceId,
  opacity,
  visible,
  onOpacity,
  onToggle,
}: {
  sourceId: SourceId;
  opacity: number;
  visible: boolean;
  onOpacity: (v: number) => void;
  onToggle: () => void;
}) {
  const src = SOURCE_OBSERVATIONS[sourceId];
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggle}
        className="shrink-0 transition-opacity"
        aria-label={visible ? `Hide ${src.label}` : `Show ${src.label}`}
      >
        {visible ? (
          <Eye className="size-4 text-ivory" />
        ) : (
          <EyeOff className="size-4 text-muted-foreground" />
        )}
      </button>
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: src.color, opacity: visible ? 1 : 0.3 }}
      />
      <span className="w-20 shrink-0 text-xs text-foreground">{src.label}</span>
      <div className="relative flex-1">
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => onOpacity(Number(e.target.value))}
          disabled={!visible}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:opacity-40"
          aria-label={`${src.label} opacity`}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
        {opacity}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Geometry Comparison Panel
// ---------------------------------------------------------------------------

function GeometryPanel() {
  const sources: SourceId[] = ["municipal", "registry", "survey"];
  const rows: { label: string; getValue: (sid: SourceId) => string }[] = [
    { label: "Area", getValue: (sid) => `${GEOMETRY_COMPARISONS[sid].area.toLocaleString()} m²` },
    { label: "Perimeter", getValue: (sid) => `${GEOMETRY_COMPARISONS[sid].perimeter.toFixed(1)} m` },
    { label: "Vertex Count", getValue: (sid) => String(GEOMETRY_COMPARISONS[sid].vertexCount) },
    { label: "Geometry Type", getValue: (sid) => GEOMETRY_COMPARISONS[sid].geometryType },
    { label: "Centroid", getValue: (sid) => `${GEOMETRY_COMPARISONS[sid].centroid[0].toFixed(4)}, ${GEOMETRY_COMPARISONS[sid].centroid[1].toFixed(4)}` },
  ];

  return (
    <div className="scrollbar-slim overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="label-technical px-2 py-2 text-left font-normal">Attribute</th>
            {sources.map((sid) => (
              <th key={sid} className="px-2 py-2 text-right font-mono font-semibold" style={{ color: SOURCE_OBSERVATIONS[sid].color }}>
                {SOURCE_OBSERVATIONS[sid].shortLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const values = sources.map((sid) => row.getValue(sid));
            const allSame = values.every((v) => v === values[0]);
            return (
              <tr key={row.label} className="border-b border-border/40 hover:bg-white/3 transition-colors">
                <td className="py-2 px-2 text-muted-foreground">{row.label}</td>
                {values.map((v, i) => (
                  <td
                    key={i}
                    className={cn(
                      "py-2 px-2 text-right font-mono",
                      !allSame ? "text-saffron" : "text-ivory",
                    )}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Area Difference callout */}
      <div className="mt-3 rounded-lg border border-saffron/30 bg-saffron/5 p-3 text-xs">
        <p className="font-mono font-semibold text-saffron">⚠ BOUNDARY DIFFERENCE DETECTED</p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
          <span>Municipal area</span><span className="font-mono text-ivory text-right">2,430 m²</span>
          <span>Registry area</span><span className="font-mono text-ivory text-right">2,510 m²</span>
          <span>Survey area</span><span className="font-mono text-ivory text-right">2,465 m²</span>
          <span>Max difference</span><span className="font-mono text-saffron text-right">80 m²</span>
          <span>Difference %</span><span className="font-mono text-saffron text-right">3.29%</span>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground/70">DEMO COMPUTATION — Not an authoritative land measurement.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Attribute Comparison Table
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<"MATCH" | "CONFLICT" | "VARIES", { label: string; variant: "verified" | "conflict" | "warning" }> = {
  MATCH: { label: "MATCH", variant: "verified" },
  CONFLICT: { label: "CONFLICT", variant: "conflict" },
  VARIES: { label: "VARIES", variant: "warning" },
};

function AttributeTable() {
  return (
    <div className="scrollbar-slim overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="label-technical px-2 py-2 text-left font-normal">Attribute</th>
            <th className="px-2 py-2 text-right font-mono font-semibold text-[#00e5ff]">MUNI</th>
            <th className="px-2 py-2 text-right font-mono font-semibold text-[#a78bfa]">REG</th>
            <th className="px-2 py-2 text-right font-mono font-semibold text-[#fbbf24]">SURV</th>
            <th className="label-technical px-2 py-2 text-right font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTE_COMPARISONS.map((row) => {
            const cfg = STATUS_CONFIG[row.status];
            return (
              <tr key={row.attribute} className="border-b border-border/40 hover:bg-white/3 transition-colors">
                <td className="py-2 px-2 text-muted-foreground">{row.attribute}</td>
                <td className={cn("py-2 px-2 text-right font-mono", row.status !== "MATCH" && "text-saffron")}>{row.municipal}</td>
                <td className={cn("py-2 px-2 text-right font-mono", row.status !== "MATCH" && "text-saffron")}>{row.registry}</td>
                <td className={cn("py-2 px-2 text-right font-mono", row.status !== "MATCH" && "text-saffron")}>{row.survey}</td>
                <td className="py-2 px-2 text-right">
                  <StatusBadge label={cfg.label} variant={cfg.variant} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Temporal Timeline
// ---------------------------------------------------------------------------

function TemporalTimeline() {
  return (
    <div className="space-y-1">
      {TEMPORAL_EVENTS.map((ev, idx) => {
        const src = SOURCE_OBSERVATIONS[ev.sourceId];
        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 shrink-0 rounded-full border-2" style={{ borderColor: src.color, backgroundColor: "transparent" }} />
              {idx < TEMPORAL_EVENTS.length - 1 && <div className="mt-1 w-0.5 flex-1 bg-border/40" />}
            </div>
            <div className="pb-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-semibold" style={{ color: src.color }}>{src.shortLabel}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{ev.date}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">{ev.confidence}%</span>
              </div>
              <p className="mt-0.5 text-xs text-foreground/80">{ev.change}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conflict Summary Panel
// ---------------------------------------------------------------------------

function ConflictPanel() {
  const cs = CONFLICT_SUMMARY;
  const items = [
    { label: "Geometry", data: cs.geometry, icon: MapPin },
    { label: "Attribute", data: cs.attribute, icon: BarChart3 },
    { label: "Temporal", data: cs.temporal, icon: Calendar },
  ] as const;

  const severityColor = (s: "HIGH" | "MEDIUM" | "LOW") =>
    s === "HIGH" ? "text-conflict" : s === "MEDIUM" ? "text-saffron" : "text-primary";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-conflict/40 bg-conflict/8 px-4 py-3">
        <AlertTriangle className="size-5 text-conflict" />
        <div>
          <p className="font-mono text-sm font-bold text-conflict">{cs.totalConflicts} CONFLICTS DETECTED</p>
          <p className="text-[10px] text-muted-foreground">SYNTHETIC DEMONSTRATION RESULTS</p>
        </div>
      </div>
      {items.map(({ label, data, icon: Icon }) =>
        data ? (
          <div key={label} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Icon className="size-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ivory">{label}</span>
                <span className={cn("font-mono text-[10px] font-bold", severityColor(data.severity))}>
                  {data.severity}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{data.description}</p>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entity Match Confidence Panel
// ---------------------------------------------------------------------------

function EntityMatchPanel() {
  const conf = ENTITY_MATCH_CONFIDENCE;
  const rows = [
    { label: "Spatial similarity", value: conf.spatial },
    { label: "Attribute similarity", value: conf.attribute },
    { label: "Temporal consistency", value: conf.temporal },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" className="stroke-muted" strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24" fill="none" className="stroke-verified" strokeWidth="4"
              strokeDasharray="150.8" strokeDashoffset={150.8 * (1 - conf.overall / 100)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute font-mono text-sm font-bold text-ivory">{conf.overall}%</span>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-ivory">ENTITY MATCH CONFIDENCE</p>
          <p className="text-[11px] font-semibold text-verified">HIGH CONFIDENCE</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">SYNTHETIC DEMO SCORES</p>
        </div>
      </div>
      <div className="space-y-2">
        {rows.map(({ label, value }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono text-ivory">{value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full", value >= 90 ? "bg-verified" : value >= 70 ? "bg-saffron" : "bg-conflict")}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Source Reliability Panel
// ---------------------------------------------------------------------------

function ReliabilityPanel() {
  const sources: SourceId[] = ["municipal", "registry", "survey"];
  const factorLabels = [
    { key: "geometryQuality", label: "Geometry quality" },
    { key: "attributeCompleteness", label: "Attribute completeness" },
    { key: "temporalFreshness", label: "Temporal freshness" },
    { key: "historicalConsistency", label: "Historical consistency" },
  ] as const;

  const [expanded, setExpanded] = useState<SourceId | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">Not representative of real government source reliability.</p>
      {sources.map((sid) => {
        const src = SOURCE_OBSERVATIONS[sid];
        const rel = src.reliability;
        const isOpen = expanded === sid;
        return (
          <div key={sid} className="rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : sid)}
              className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-white/4 transition-colors"
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
              <span className="flex-1 text-left text-xs font-semibold text-ivory">{src.label}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-verified" style={{ width: `${rel.overall}%` }} />
                </div>
                <span className="font-mono text-xs text-ivory">{rel.overall}/100</span>
              </div>
              <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
            </button>
            {isOpen && (
              <div className="border-t border-border/50 px-3 pb-3 pt-2 space-y-1.5">
                {factorLabels.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-36 shrink-0 text-[11px] text-muted-foreground">{label}</span>
                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60" style={{ width: `${rel[key]}%` }} />
                    </div>
                    <span className="w-7 text-right font-mono text-[11px] text-ivory">{rel[key]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Property Profile Panel
// ---------------------------------------------------------------------------

function PropertyProfile({
  parcelId,
  onInvestigate,
}: {
  parcelId: string;
  onInvestigate: () => void;
}) {
  const parcel = DEMO_PARCEL;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" />
          <div>
            <p className="font-mono text-[11px] text-muted-foreground">CANONICAL ENTITY</p>
            <p className="font-display text-sm font-bold text-ivory mt-0.5">{parcel.id}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs border-t border-border pt-3">
          {[
            ["Entity Type", parcel.entityType],
            ["Status", parcel.currentStatus],
            ["Match Confidence", `${parcel.matchConfidence}%`],
            ["Sources", String(parcel.sourceCount)],
            ["Conflicts", String(parcel.conflictCount)],
            ["Last Observed", parcel.lastObserved],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className={cn("text-right font-mono", k === "Status" ? "text-conflict" : k === "Match Confidence" ? "text-verified" : "text-ivory")}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onInvestigate}
          id="btn-investigate-conflicts"
        >
          <AlertTriangle className="size-4 text-conflict" />
          Investigate Conflicts
        </Button>
        <Button size="sm" variant="outline" className="w-full justify-start gap-2" id="btn-view-evidence">
          <Info className="size-4" />
          View Evidence
        </Button>
        <Button size="sm" variant="ghost" className="w-full justify-start gap-2" id="btn-open-verification">
          <CheckCircle className="size-4 text-verified" />
          Open Verification
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

type DetailTab = "geometry" | "attributes" | "temporal" | "conflicts" | "entity-match" | "reliability";

const DETAIL_TABS: { id: DetailTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "geometry", label: "Geometry", icon: MapPin },
  { id: "attributes", label: "Attributes", icon: BarChart3 },
  { id: "temporal", label: "Timeline", icon: Calendar },
  { id: "conflicts", label: "Conflicts", icon: AlertTriangle },
  { id: "entity-match", label: "Entity Match", icon: ShieldCheck },
  { id: "reliability", label: "Reliability", icon: Zap },
];

function ComparisonWorkspace() {
  const navigate = useNavigate();

  // State
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("side-by-side");
  const [activeSources, setActiveSources] = useState<Record<SourceId, boolean>>({
    municipal: true, registry: true, survey: true,
  });
  const [opacities, setOpacities] = useState<Record<SourceId, number>>({
    municipal: 100, registry: 70, survey: 50,
  });
  const [showConflictZone, setShowConflictZone] = useState(true);
  const [detailTab, setDetailTab] = useState<DetailTab>("geometry");
  const [showProfile, setShowProfile] = useState(false);

  // Load demo scenario
  const loadDemo = useCallback(() => {
    setSelectedEntityId("PARCEL-DEMO-014");
    setDemoLoaded(true);
    setActiveSources({ municipal: true, registry: true, survey: true });
    setOpacities({ municipal: 100, registry: 70, survey: 50 });
    setComparisonMode("side-by-side");
    setShowConflictZone(true);
    setShowProfile(true);
    setDetailTab("conflicts");
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    setSelectedEntityId(null);
    setDemoLoaded(false);
    setComparisonMode("side-by-side");
    setActiveSources({ municipal: true, registry: true, survey: true });
    setOpacities({ municipal: 100, registry: 70, survey: 50 });
    setShowConflictZone(true);
    setShowProfile(false);
    setDetailTab("geometry");
  }, []);

  const handleToggleSource = (sid: SourceId) => {
    setActiveSources((prev) => ({ ...prev, [sid]: !prev[sid] }));
  };

  const handleOpacity = (sid: SourceId, v: number) => {
    setOpacities((prev) => ({ ...prev, [sid]: v }));
  };

  const isEntityLoaded = !!selectedEntityId;
  const sources: SourceId[] = ["municipal", "registry", "survey"];

  return (
    <div className="relative space-y-4 px-4 py-6 md:px-6 md:py-8 max-w-[1600px] mx-auto">
      {/* Aurora background */}
      <div className="dash-aurora pointer-events-none absolute inset-0 -z-10" aria-hidden />

      {/* Header */}
      <PageHeader
        eyebrow="Workspace · Prompt 5"
        title="Multi-Source Comparison"
        description="One property — multiple sources — different representations — comparison. Identify boundary discrepancies, attribute conflicts and temporal inconsistencies across cadastral datasets."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!demoLoaded ? (
              <Button
                id="btn-load-demo"
                onClick={loadDemo}
                className="gap-2 bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30"
              >
                <Play className="size-4" />
                Load Demo Property
              </Button>
            ) : (
              <Button id="btn-reset" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="size-4" />
                Reset Comparison
              </Button>
            )}
          </div>
        }
      />

      <DemoDataNotice />

      {/* Workflow progress */}
      <WorkflowProgress active={1} />

      {/* Entity Search */}
      <GlassPanel title="Compare Entity">
        <EntitySearch onSelect={(id) => { setSelectedEntityId(id); setShowProfile(true); }} selectedId={selectedEntityId} />
        {isEntityLoaded && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-semibold text-ivory">{selectedEntityId}</span>
              <span>—</span>
              <span>Canonical entity</span>
            </div>
            <span className="label-technical text-verified">3 observations available</span>
          </div>
        )}
      </GlassPanel>

      {/* Source Cards */}
      {isEntityLoaded && (
        <GlassPanel title="Available Observations">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {sources.map((sid) => (
              <SourceCard
                key={sid}
                sourceId={sid}
                active={activeSources[sid]}
                onClick={() => handleToggleSource(sid)}
              />
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Main workspace */}
      {isEntityLoaded ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          {/* Left: Map + Detail */}
          <div className="space-y-4">
            {/* Mode selector */}
            <ModeTabBar active={comparisonMode} onChange={setComparisonMode} />

            {/* Map comparison area */}
            <div className="min-h-[380px]">
              {comparisonMode === "side-by-side" && (
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${sources.filter(s => activeSources[s]).length || 1}, 1fr)` }}>
                  {sources.filter((s) => activeSources[s]).map((sid) => (
                    <SingleSourceMap
                      key={sid}
                      sourceId={sid}
                      className="h-[340px]"
                    />
                  ))}
                  {sources.every((s) => !activeSources[s]) && (
                    <div className="col-span-3 flex h-[340px] items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                      Enable at least one source to see comparison
                    </div>
                  )}
                </div>
              )}

              {comparisonMode === "overlay" && (
                <div className="space-y-3">
                  <OverlayMap
                    className="h-[380px]"
                    activeSources={activeSources}
                    opacities={opacities}
                    showConflictZone={showConflictZone}
                  />
                  {/* Opacity controls */}
                  <GlassPanel title="Layer Controls">
                    <div className="space-y-3">
                      {sources.map((sid) => (
                        <OpacityRow
                          key={sid}
                          sourceId={sid}
                          opacity={opacities[sid]}
                          visible={activeSources[sid]}
                          onOpacity={(v) => handleOpacity(sid, v)}
                          onToggle={() => handleToggleSource(sid)}
                        />
                      ))}
                      <div className="flex items-center justify-between border-t border-border pt-2">
                        <span className="text-xs text-muted-foreground">Show conflict zone</span>
                        <button
                          onClick={() => setShowConflictZone((v) => !v)}
                          className={cn(
                            "flex h-5 w-9 items-center rounded-full border transition-all",
                            showConflictZone ? "border-red-500/60 bg-red-950/40" : "border-border bg-muted",
                          )}
                        >
                          <span className={cn("h-3.5 w-3.5 rounded-full bg-red-400 transition-transform mx-0.5", showConflictZone ? "translate-x-4" : "translate-x-0")} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-border pt-2">
                        <Button size="sm" variant="outline" onClick={() => setActiveSources({ municipal: true, registry: true, survey: true })} className="text-xs">Show all</Button>
                        <Button size="sm" variant="ghost" onClick={() => setActiveSources({ municipal: false, registry: false, survey: false })} className="text-xs">Hide all</Button>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              )}

              {comparisonMode === "difference" && (
                <div className="space-y-3">
                  <DifferenceMap className="h-[380px]" />
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Conflict Zone Area", value: "~80 m²", tone: "text-conflict" },
                      { label: "Max Boundary Offset", value: "~1.8 m", tone: "text-saffron" },
                      { label: "Overlap Consensus", value: "96.7%", tone: "text-verified" },
                    ].map(({ label, value, tone }) => (
                      <div key={label} className="rounded-xl border border-border p-3 text-center">
                        <p className="label-technical">{label}</p>
                        <p className={cn("mt-1 font-display text-lg font-bold", tone)}>{value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">DEMO</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detail Tabs */}
            <GlassPanel>
              {/* Tab navigation */}
              <div className="scrollbar-slim -mx-1 flex gap-0.5 overflow-x-auto pb-1 border-b border-border mb-4">
                {DETAIL_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setDetailTab(id)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap",
                      detailTab === id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    <Icon className="size-3" />
                    {label}
                    {id === "conflicts" && CONFLICT_SUMMARY.totalConflicts > 0 && (
                      <span className="rounded-full bg-conflict/30 px-1.5 py-0.5 text-[9px] text-conflict">{CONFLICT_SUMMARY.totalConflicts}</span>
                    )}
                  </button>
                ))}
              </div>

              {detailTab === "geometry" && <GeometryPanel />}
              {detailTab === "attributes" && <AttributeTable />}
              {detailTab === "temporal" && (
                <div>
                  <p className="mb-3 text-xs text-muted-foreground">Chronological update history across all sources. Dates are synthetic demonstration values.</p>
                  <TemporalTimeline />
                </div>
              )}
              {detailTab === "conflicts" && <ConflictPanel />}
              {detailTab === "entity-match" && <EntityMatchPanel />}
              {detailTab === "reliability" && <ReliabilityPanel />}
            </GlassPanel>
          </div>

          {/* Right: Property Profile + Conflict Summary */}
          <div className="space-y-4">
            {showProfile && (
              <GlassPanel title="Property Profile">
                <PropertyProfile
                  parcelId={selectedEntityId!}
                  onInvestigate={() => navigate({ to: "/conflicts" })}
                />
              </GlassPanel>
            )}

            {/* Quick conflict heatmap legend */}
            <GlassPanel title="Conflict Intensity (Demo)">
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground">Synthetic visual indicator of source disagreement strength at this entity.</p>
                {[
                  { label: "Boundary geometry", value: 62, color: "bg-saffron" },
                  { label: "Land-use attribute", value: 85, color: "bg-conflict" },
                  { label: "Area discrepancy", value: 55, color: "bg-saffron" },
                  { label: "Temporal gap", value: 30, color: "bg-primary" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono text-xs text-ivory">{value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Low</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-saffron" />Medium</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-conflict" />High</span>
                </div>
              </div>
            </GlassPanel>

            {/* Source quick toggles */}
            <GlassPanel title="Interactive Source Toggle">
              <div className="space-y-2">
                {sources.map((sid) => {
                  const src = SOURCE_OBSERVATIONS[sid];
                  return (
                    <div key={sid} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: src.color, opacity: activeSources[sid] ? 1 : 0.3 }} />
                        <span className="text-xs text-foreground">{src.label}</span>
                      </div>
                      <button
                        onClick={() => handleToggleSource(sid)}
                        className={cn(
                          "flex h-5 w-9 items-center rounded-full border transition-all",
                          activeSources[sid] ? "border-primary/50 bg-primary/20" : "border-border bg-muted",
                        )}
                        aria-label={activeSources[sid] ? `Hide ${src.label}` : `Show ${src.label}`}
                      >
                        <span
                          className={cn(
                            "h-3.5 w-3.5 rounded-full transition-transform mx-0.5",
                            activeSources[sid] ? "translate-x-4 bg-primary" : "translate-x-0 bg-muted-foreground/60",
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setActiveSources({ municipal: true, registry: true, survey: true })} className="flex-1 text-xs">Show All</Button>
                  <Button size="sm" variant="ghost" onClick={() => setActiveSources({ municipal: false, registry: false, survey: false })} className="flex-1 text-xs">Hide All</Button>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      ) : (
        /* Empty state */
        <GlassPanel>
          <div className="spatial-grid flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-border text-center p-8">
            <div className="relative">
              <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
                <GitCompare className="size-7 text-primary" />
              </div>
            </div>
            <div className="max-w-md">
              <p className="font-display text-lg font-bold text-ivory">Multi-Source Comparison Workspace</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Search for a property or load the demo scenario to begin comparing cadastral sources side-by-side, in overlay, or in difference mode.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                id="btn-load-demo-empty"
                onClick={loadDemo}
                className="gap-2"
              >
                <Play className="size-4" />
                Load Demo Property
              </Button>
              <p className="text-xs text-muted-foreground">or search for a parcel above</p>
            </div>
            <div className="flex gap-6 text-xs text-muted-foreground">
              {["ONE PROPERTY", "MULTIPLE SOURCES", "COMPARISON"].map((t, i) => (
                <div key={t} className="flex items-center gap-2">
                  {i > 0 && <span className="text-primary">→</span>}
                  <span className="font-mono font-semibold text-ivory">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
