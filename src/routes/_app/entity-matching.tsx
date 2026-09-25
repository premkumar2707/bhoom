import { createFileRoute } from "@tanstack/react-router";
import {
  GitMerge,
  Network,
  AlertTriangle,
  Link2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/common/ModulePage";
import { DemoDataNotice } from "@/components/common/TrustBadge";
import { GlassPanel, StatusBadge, EmptyState } from "@/components/ui/bhumitra";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/entity-matching")({
  head: () => ({
    meta: [
      { title: "Entity Matching — BHOO-MITRA AI" },
      {
        name: "description",
        content:
          "Spatial entity matching workspace — identify, link and disambiguate parcels across multiple sources.",
      },
      { property: "og:title", content: "Entity Matching — BHOO-MITRA AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntityMatchingPage,
});

type MatchClass = "1:1 Match" | "1:Many (Split)" | "Many:1 (Merge)" | "Unmatched A" | "Unmatched B" | "Ambiguous";
type MatchStatus = "Confirmed" | "Proposed" | "Rejected" | "PendingReview";

interface MatchRecord {
  id: string;
  parcelA: string;
  parcelB: string | string[];
  matchClass: MatchClass;
  confidence: number;
  basisOf: string;
  status: MatchStatus;
  iouScore: number;
  ward: string;
}

const MATCH_DATA: MatchRecord[] = [
  { id: "MATCH-DEMO-001", parcelA: "PARCEL-DEMO-001", parcelB: "MP-10482", matchClass: "1:1 Match", confidence: 0.96, basisOf: "Overlap IoU ≥ 0.92 + Parcel ID", status: "Confirmed", iouScore: 0.92, ward: "Ward 12" },
  { id: "MATCH-DEMO-002", parcelA: "PARCEL-DEMO-002", parcelB: "MP-10490", matchClass: "1:1 Match", confidence: 0.81, basisOf: "Overlap IoU 0.81 + Area difference 7.8%", status: "PendingReview", iouScore: 0.81, ward: "Ward 12" },
  { id: "MATCH-DEMO-003", parcelA: "PARCEL-DEMO-004", parcelB: ["MP-11001", "MP-11002", "MP-11003"], matchClass: "1:Many (Split)", confidence: 0.58, basisOf: "Spatial containment; Revenue parcel contains 3 Municipal entries", status: "PendingReview", iouScore: 0.58, ward: "Ward 15" },
  { id: "MATCH-DEMO-004", parcelA: "PARCEL-DEMO-009", parcelB: "MP-10520", matchClass: "1:1 Match", confidence: 0.88, basisOf: "Overlap IoU 0.88 + survey_no pattern match", status: "Confirmed", iouScore: 0.88, ward: "Ward 12" },
  { id: "MATCH-DEMO-005", parcelA: "PARCEL-DEMO-010", parcelB: [], matchClass: "Unmatched A", confidence: 0.0, basisOf: "No Municipal spatial counterpart found within 10 m buffer", status: "Rejected", iouScore: 0.0, ward: "Ward 14" },
  { id: "MATCH-DEMO-006", parcelA: "PARCEL-DEMO-007", parcelB: "MP-10501", matchClass: "1:1 Match", confidence: 0.69, basisOf: "Spatial overlap only; attribute identifiers differ", status: "PendingReview", iouScore: 0.74, ward: "Ward 14" },
  { id: "MATCH-DEMO-007", parcelA: "PARCEL-DEMO-011", parcelB: "MP-10460", matchClass: "1:1 Match", confidence: 0.94, basisOf: "Overlap IoU 0.94 + exact survey_no match", status: "Confirmed", iouScore: 0.94, ward: "Ward 14" },
];

const CLASS_TONE: Record<MatchClass, string> = {
  "1:1 Match": "text-verified",
  "1:Many (Split)": "text-saffron",
  "Many:1 (Merge)": "text-cyan",
  "Unmatched A": "text-conflict",
  "Unmatched B": "text-conflict",
  "Ambiguous": "text-saffron",
};

const STATUS_VARIANT: Record<MatchStatus, "verified" | "warning" | "conflict" | "muted"> = {
  Confirmed: "verified",
  Proposed: "warning",
  Rejected: "conflict",
  PendingReview: "muted",
};

const SUMMARY_STATS: [string, string, string][] = [
  ["1:1 Confirmed", "10,842", "IoU ≥ 0.85 + ID match"],
  ["Split (1:Many)", "412", "Subdivision cases"],
  ["Merge (Many:1)", "96", "Amalgamation cases"],
  ["Unmatched — Source A", "1,130", "No spatial counterpart"],
  ["Unmatched — Source B", "582", "Possible new parcels"],
  ["Ambiguous / Under Review", "7", "Needs officer review"],
];

function EntityMatchingPage() {
  const [sel, setSel] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filterClass, setFilterClass] = useState<MatchClass | "All">("All");

  const list = MATCH_DATA
    .filter((m) => filterClass === "All" || m.matchClass === filterClass)
    .filter((m) => !q || `${m.id} ${m.parcelA} ${m.ward}`.toLowerCase().includes(q.toLowerCase()));

  const cur = MATCH_DATA.find((m) => m.id === sel) ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Resolution"
        title="Entity Matching"
        description="Identify, link and disambiguate spatial entities across Revenue, Municipal and Survey sources. Automated candidates require human confirmation before being used in harmonization."
      />
      <DemoDataNotice />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {SUMMARY_STATS.map(([label, value, note]) => (
          <GlassPanel key={label} className="p-3">
            <p className="label-technical">{label}</p>
            <p className="mt-1 font-display text-xl font-bold text-ivory">{value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{note}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Left panel — match list */}
        <Panel
          title="Match queue"
          meta={<span className="label-technical">{list.length} shown</span>}
          className={cn(cur && "hidden lg:block")}
        >
          <div className="mb-3 space-y-2">
            <label className="flex items-center gap-2 rounded-md border border-border px-2">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, parcel, ward…"
                className="h-9 w-full bg-transparent text-sm outline-none"
              />
            </label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as MatchClass | "All")}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="All">All match classes</option>
              {(["1:1 Match", "1:Many (Split)", "Many:1 (Merge)", "Unmatched A", "Unmatched B", "Ambiguous"] as MatchClass[]).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {list.length === 0 ? (
            <EmptyState title="No matches" description="Try adjusting the filter or search query." icon={Network} />
          ) : (
            <ul className="space-y-2">
              {list.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => setSel(m.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left text-xs transition-colors",
                      sel === m.id ? "border-primary/60 bg-primary/5" : "border-border hover:border-primary/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-muted-foreground">{m.id}</span>
                      <StatusBadge label={m.status} variant={STATUS_VARIANT[m.status]} />
                    </div>
                    <p className={cn("mt-1 font-medium", CLASS_TONE[m.matchClass])}>{m.matchClass}</p>
                    <p className="mt-0.5 text-muted-foreground">{m.parcelA} → {Array.isArray(m.parcelB) ? m.parcelB.join(", ") : (m.parcelB || "—")}</p>
                    <p className="mt-1 text-muted-foreground">IoU {(m.iouScore * 100).toFixed(0)}% · confidence {(m.confidence * 100).toFixed(0)}% · {m.ward}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Right panel — detail */}
        {cur ? (
          <div className="space-y-4">
            <Panel title={`${cur.id} · ${cur.matchClass}`} meta={<StatusBadge label={cur.status} variant={STATUS_VARIANT[cur.status]} />}>
              <Button size="sm" variant="ghost" className="mb-2 lg:hidden" onClick={() => setSel(null)}>
                ← Back to queue
              </Button>
              <dl className="grid grid-cols-2 gap-y-2 text-xs">
                {[
                  ["Match ID", cur.id],
                  ["Ward", cur.ward],
                  ["Source A Parcel", cur.parcelA],
                  ["Source B Parcel(s)", Array.isArray(cur.parcelB) ? cur.parcelB.join(", ") : (cur.parcelB || "—")],
                  ["IoU Score", `${(cur.iouScore * 100).toFixed(0)}%`],
                  ["Confidence", `${(cur.confidence * 100).toFixed(0)}%`],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-mono text-ivory">{v}</dd>
                  </div>
                ))}
              </dl>
              {/* IoU bar */}
              <div className="mt-3">
                <p className="mb-1 label-technical">Intersection over Union</p>
                <div className="h-2 rounded bg-muted">
                  <div
                    className={cn("h-full rounded", cur.iouScore >= 0.85 ? "bg-verified" : cur.iouScore >= 0.6 ? "bg-saffron" : "bg-conflict")}
                    style={{ width: `${cur.iouScore * 100}%` }}
                  />
                </div>
              </div>
            </Panel>

            <Panel title="Matching basis">
              <p className="text-sm text-muted-foreground">{cur.basisOf}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Automated spatial matching. Neither source is assumed authoritative — a confirmed match is a working hypothesis pending human review.
              </p>
            </Panel>

            <Panel title="Candidate actions">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="flex items-center gap-1.5" disabled={cur.status === "Confirmed"}>
                  <CheckCircle className="size-4 text-verified" /> Confirm match
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1.5" disabled={cur.status === "Rejected"}>
                  <XCircle className="size-4 text-conflict" /> Reject
                </Button>
                <Button size="sm" variant="ghost" className="flex items-center gap-1.5">
                  <GitMerge className="size-4" /> Send to Harmonization
                </Button>
                <Button size="sm" variant="ghost" className="flex items-center gap-1.5">
                  <Link2 className="size-4" /> View in Conflicts <ChevronRight className="size-3" />
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Demo — actions are local only. Confirmed matches flow to the Harmonization engine.
              </p>
            </Panel>
          </div>
        ) : (
          <Panel className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
            <EmptyState
              icon={Network}
              title="Select a match to investigate"
              description="Choose a candidate from the queue on the left to see its spatial basis, confidence breakdown and available actions."
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
