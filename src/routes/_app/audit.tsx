import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader, Panel } from "@/components/common/ModulePage";
import { DemoDataNotice } from "@/components/common/TrustBadge";
import { Button } from "@/components/ui/button";
import { useVerificationQueue } from "@/hooks/use-verification";
import { download, toCSV } from "@/lib/export";

export const Route = createFileRoute("/_app/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail — BhuSetu" },
      { name: "description", content: "Every review action, candidate change and decision, with reviewer, time and candidate version." },
      { property: "og:title", content: "Audit Trail — BhuSetu" },
      { property: "og:description", content: "Structured, exportable audit events for every verification action." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const queue = useVerificationQueue();
  const all = queue.flatMap((i) => i.events.map((e) => ({ ...e, item: i.id, parcel: i.parcel }))).sort((a, b) => b.at.localeCompare(a.at));
  const types = [...new Set(all.map((e) => e.type))];
  const [t, setT] = useState("");
  const [q, setQ] = useState("");
  const list = all.filter((e) => (!t || e.type === t) && (!q || `${e.item} ${e.parcel} ${e.detail}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Records" title="Audit Trail" description="Append-only log of review actions. Events are recorded in this browser for the demo; the structure is ready for a server-side audit store." actions={<Button size="sm" variant="outline" disabled={!list.length} onClick={() => download("bhusetu-audit-demo.csv", toCSV(list), "text/csv")}><Download className="size-4" />Export CSV</Button>} />
      <DemoDataNotice />
      <Panel title="Events" meta={<span className="label-technical">{list.length}</span>}>
        <div className="mb-3 flex flex-wrap gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search record, parcel, detail…" className="h-10 flex-1 rounded-md border border-border bg-transparent px-2 text-sm" />
          <select value={t} onChange={(e) => setT(e.target.value)} className="h-10 rounded-md border border-border bg-background px-2 text-sm"><option value="">All event types</option>{types.map((x) => <option key={x}>{x}</option>)}</select>
        </div>
        {list.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No events yet. Actions on the Verification page appear here.</p> : (
          <div className="scrollbar-slim overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="label-technical">{["Time", "Event", "Record", "Version", "Reviewer", "Detail"].map((h) => <th key={h} className="border-b border-border px-2 py-2 font-normal">{h}</th>)}</tr></thead>
              <tbody>{list.map((e, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-2 py-2 font-mono text-muted-foreground">{new Date(e.at).toLocaleString()}</td>
                  <td className="px-2 py-2 text-ivory">{e.type}</td><td className="px-2 py-2 font-mono">{e.item} · {e.parcel}</td>
                  <td className="px-2 py-2">v{e.version}</td><td className="px-2 py-2">{e.reviewer}</td><td className="px-2 py-2 text-muted-foreground">{e.detail}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
