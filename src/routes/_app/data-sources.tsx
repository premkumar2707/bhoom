import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Database, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/ModulePage";
import { DemoDataNotice } from "@/components/common/TrustBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { datasetRepository, relTime, statusMeta, type Dataset } from "@/lib/datasets";
import { AddDataSource } from "@/components/data/AddDataSource";
import { DatasetDetail } from "@/components/data/DatasetDetail";
import { MiniMap } from "@/components/data/MiniMap";
import { useNotifications } from "@/components/notifications/NotificationProvider";

export const Route = createFileRoute("/_app/data-sources")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s["q"] === "string" ? { q: s["q"] } : {}),
  head: () => ({
    meta: [
      { title: "Data Sources — BhuSetu" },
      { name: "description", content: "Ingest and inspect cadastral, municipal GIS, imagery and survey datasets with CRS, quality and authority metadata." },
      { property: "og:title", content: "Data Sources — BhuSetu" },
      { property: "og:description", content: "Multi-source geospatial data ingestion workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DataSourcesPage,
});

function DataSourcesPage() {
  const { q: initialQ } = Route.useSearch();
  const mobile = useIsMobile();
  const { push } = useNotifications();
  const [items, setItems] = useState<Dataset[]>([]);
  const [q, setQ] = useState(initialQ ?? "");
  const [sel, setSel] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { datasetRepository.list().then((l) => { setItems(l); setSel((s) => s ?? l[0]?.id ?? null); }); }, []);
  useEffect(() => setQ(initialQ ?? ""), [initialQ]);

  // Simulated processing of in-flight datasets
  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) => prev.map((d) => {
        if (d.status !== "processing") return d;
        const p = Math.min(100, d.progress + 4);
        if (p === 100) push({ title: "Dataset processing completed", body: `${d.name} is ready for alignment.`, category: "processing", priority: "normal" });
        return { ...d, progress: p, status: p === 100 ? "ready" : d.status, processingStage: p === 100 ? "Complete" : d.processingStage };
      }));
    }, 1500);
    return () => clearInterval(t);
  }, [push]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return items;
    if (s.includes("crs")) return items.filter((d) => !d.crs || d.status === "crs-review");
    if (s.includes("recent")) return [...items].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0, 4);
    return items.filter((d) => `${d.name} ${d.source} ${d.format} ${d.sourceType}`.toLowerCase().includes(s.replace(/^(find|show) (datasets? )?(from )?/, "")));
  }, [items, q]);

  const current = items.find((d) => d.id === sel) ?? null;

  const add = async (d: Dataset) => {
    await datasetRepository.add(d);
    setItems((p) => [d, ...p.filter((x) => x.id !== d.id)]);
    setSel(d.id);
    push({ title: "Dataset uploaded", body: `${d.name} added (demo).`, category: "processing", priority: "normal" });
    push(d.crs
      ? { title: "Dataset processing started", body: `${d.name} entered ingestion.`, category: "processing", priority: "normal" }
      : { title: "CRS requires review", body: `${d.name} has no confidently identified spatial reference.`, category: "verification", priority: "high" });
  };

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      <PageHeader
        eyebrow="Inputs"
        title="Data Sources"
        description="What data exists, where it came from, what format it uses, when it was updated and whether it has been processed."
        actions={<Button className="h-11" onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" />Add Data Source</Button>}
      />
      <DemoDataNotice />
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input aria-label="Filter datasets" className="h-11 pl-9" placeholder="Try “crs review”, “recent” or “municipal”" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {items.length === 0 ? (
        <div className="spatial-grid flex flex-col items-center rounded-xl border border-dashed border-border p-12 text-center">
          <Database className="h-8 w-8 text-primary" />
          <p className="mt-3 font-display font-bold text-ivory">No datasets connected</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Bring your first land, cadastral, survey, or imagery dataset into BhuSetu.</p>
          <Button className="mt-4 h-11" onClick={() => setAddOpen(true)}>Add Data Source</Button>
        </div>
      ) : mobile ? (
        <ul className="space-y-3">
          {filtered.map((d) => (
            <li key={d.id}>
              <button onClick={() => { setSel(d.id); setDetailOpen(true); }} className="panel-surface flex w-full gap-3 rounded-xl p-4 text-left">
                <MiniMap seed={d.seed} className="h-20 w-24 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="label-technical truncate">{d.source}</p>
                  <p className="truncate font-display font-bold text-ivory">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.kind} · {d.format} · <span className="font-mono">{d.crs ?? "CRS ?"}</span></p>
                  <p className="mt-1 flex justify-between text-xs"><span>{d.recordCount?.toLocaleString() ?? "—"} rec · {relTime(d.updatedAt)}</span><span className={statusMeta[d.status].tone}>● {statusMeta[d.status].label}</span></p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="panel-surface overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left">{["Source", "Dataset", "Type", "Format", "CRS", "Updated", "Records", "Status"].map((h) => <th key={h} className="label-technical px-3 py-3 font-normal">{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} tabIndex={0} onClick={() => setSel(d.id)} onKeyDown={(e) => e.key === "Enter" && setSel(d.id)}
                    className={cn("cursor-pointer border-b border-border/60 transition-colors hover:bg-primary/5 focus:outline-none focus-visible:bg-primary/10", sel === d.id && "bg-primary/10")}>
                    <td className="px-3 py-3 text-muted-foreground">{d.source}</td>
                    <td className="px-3 py-3 font-semibold text-ivory">{d.name}</td>
                    <td className="px-3 py-3">{d.kind}</td>
                    <td className="px-3 py-3 font-mono text-xs">{d.format}</td>
                    <td className={cn("px-3 py-3 font-mono text-xs", !d.crs && "text-saffron")}>{d.crs ?? "Unconfirmed"}</td>
                    <td className="px-3 py-3 text-xs">{relTime(d.updatedAt)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{d.recordCount?.toLocaleString() ?? "—"}</td>
                    <td className={cn("px-3 py-3 text-xs font-semibold", statusMeta[d.status].tone)}>● {statusMeta[d.status].label}{d.status === "processing" && ` ${d.progress}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {current && <aside className="panel-surface rounded-xl p-5 xl:sticky xl:top-4 xl:self-start"><DatasetDetail d={current} /></aside>}
        </div>
      )}

      {mobile && (
        <Sheet open={detailOpen && !!current} onOpenChange={setDetailOpen}>
          <SheetContent side="bottom" className="h-[100dvh] overflow-y-auto">
            <SheetHeader><SheetTitle className="sr-only">Dataset detail</SheetTitle></SheetHeader>
            {current && <DatasetDetail d={current} />}
          </SheetContent>
        </Sheet>
      )}
      <AddDataSource open={addOpen} onOpenChange={setAddOpen} onAdd={add} />
    </div>
  );
}

