import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw } from "lucide-react";
import { PageHeader, Panel } from "@/components/common/ModulePage";
import { DemoDataNotice } from "@/components/common/TrustBadge";
import { Button } from "@/components/ui/button";
import { useVerificationQueue } from "@/hooks/use-verification";
import { resetDemoData } from "@/lib/verification";
import { download } from "@/lib/export";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Analytics & Reports — BhuSetu" },
      { name: "description", content: "Conflict, verification and pipeline analytics with exportable demo reports." },
      { property: "og:title", content: "Analytics & Reports — BhuSetu" },
      { property: "og:description", content: "Verification throughput, conflict distribution and exportable summaries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map((d) => d[1]));
  return (
    <ul className="space-y-2 text-xs">
      {data.map(([k, v]) => (
        <li key={k}><div className="flex justify-between"><span>{k}</span><span className="font-mono text-ivory">{v}</span></div>
          <div className="mt-1 h-2 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${(v / max) * 100}%` }} /></div></li>
      ))}
    </ul>
  );
}

function ReportsPage() {
  const q = useVerificationQueue();
  const count = <T extends string>(xs: T[]) => Object.entries(xs.reduce<Record<string, number>>((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {})) as [string, number][];
  const byStatus = count(q.map((i) => i.status));
  const bySev = count(q.map((i) => i.severity));
  const byConflict = count(q.flatMap((i) => i.conflicts));
  const pipeline: [string, number][] = [["Ingested", 48260], ["Standardized", 46110], ["Aligned", 44980], ["Matched", 42300], ["Harmonized", 41870]];
  const summary = { demo: true, generatedAt: new Date().toISOString(), candidates: q.length, verified: q.filter((i) => i.verified).length, byStatus, bySeverity: bySev, byConflictType: byConflict, avgEvidence: Math.round(q.reduce((s, i) => s + i.evidence, 0) / q.length) };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Records" title="Analytics & Reports" description="Live figures from the demo verification workspace, plus illustrative pipeline totals."
        actions={<>
          <Button size="sm" variant="outline" onClick={() => download("bhusetu-report-demo.json", JSON.stringify(summary, null, 2))}><Download className="size-4" />Export report</Button>
          <Button size="sm" variant="ghost" onClick={() => { if (confirm("Reset all demo decisions, edits and audit events?")) resetDemoData(); }}><RotateCcw className="size-4" />Reset demo data</Button>
        </>} />
      <DemoDataNotice />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[["Candidates", q.length], ["Verified", summary.verified], ["Avg evidence", `${summary.avgEvidence}%`], ["Audit events", q.reduce((s, i) => s + i.events.length, 0)]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border p-3"><p className="label-technical">{k}</p><p className="font-display text-2xl font-bold text-ivory">{v}</p></div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Verification status"><Bars data={byStatus} /></Panel>
        <Panel title="Conflict severity"><Bars data={bySev} /></Panel>
        <Panel title="Conflict types"><Bars data={byConflict} /></Panel>
        <Panel title="Processing pipeline (illustrative)"><Bars data={pipeline} /></Panel>
      </div>
    </div>
  );
}
