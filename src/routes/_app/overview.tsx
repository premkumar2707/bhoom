import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlignCenterHorizontal, CheckCircle2, Cog, Database, FileInput, GitMerge, Layers, Radar, ShieldCheck, TriangleAlert, Workflow,
} from "lucide-react";
import { Panel, PageHeader } from "@/components/common/ModulePage";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Megaphone, Video, Satellite, MapPin, FileText, Search, Phone, Landmark, Box } from "lucide-react";
import { KpiCard, GlassPanel, MapContainer, StatusBadge, PageWrapper } from "@/components/ui/bhumitra";
import { DemoDataNotice } from "@/components/common/TrustBadge";
import { IntelligenceWorkspace } from "@/components/ui/IntelligenceWorkspace";
import { MapEngine } from "@/components/maps/MapEngine";
import { MapInspector } from "@/components/maps/MapInspector";
import { LayerControl, type ActiveLayers } from "@/components/maps/LayerControl";

export const Route = createFileRoute("/_app/overview")({
  head: () => ({
    meta: [
      { title: "Intelligence Overview — BHOO-MITRA AI" },
      { name: "description", content: "Monitor incoming land data, spatial harmonization, conflicts and verification from one workspace." },
      { property: "og:title", content: "Intelligence Overview — BHOO-MITRA AI" },
      { property: "og:description", content: "Geospatial intelligence dashboard for land data harmonization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

const jobs = [
  { n: "Municipal GIS — Ward 18", s: "Spatial alignment", p: 72, state: "Processing" },
  { n: "Revenue Parcel Dataset", s: "Schema normalization", p: 100, state: "Completed" },
  { n: "Drone Survey — Zone 4", s: "Geometry extraction", p: 0, state: "Queued" },
];

const sources = [
  ["Revenue Records", 3, "2h ago", "Ready", "High"], ["Cadastral Maps", 2, "1d ago", "Needs alignment", "High"],
  ["Municipal GIS", 2, "Yesterday", "Processing", "Medium"], ["Satellite Imagery", 1, "3d ago", "Ready", "Medium"],
];

function Overview() {
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>({
     municipal: true,
     registry: true,
     survey: true,
     buildings: false,
     conflicts: true
  });

  return (
    <PageWrapper className="-m-4 p-4 pb-24 md:-m-6 md:p-6 md:pb-6">
      
      <PageHeader 
         eyebrow="Overview"
         title="Urban Land Intelligence" 
         description="Multi-source spatial harmonization overview" 
         actions={
           <div className="flex flex-col items-end gap-3 md:flex-row md:items-center">
             {/* 2D/3D ViewMode Toggle */}
             <div className="flex items-center rounded-md border border-border bg-surface p-0.5 mr-2">
                <div className="flex items-center gap-2 rounded bg-background px-3 py-1.5 text-xs font-bold text-ivory shadow-sm border border-border/50">
                   <MapPin className="h-3.5 w-3.5 text-primary" /> 2D Map
                </div>
                <Link to="/intelligence-3d" className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-ivory transition-colors">
                   <Box className="h-3.5 w-3.5" /> 3D Scene
                </Link>
             </div>
             
             <StatusBadge label="SYSTEM OPERATIONAL" variant="verified" pulse />
             <Button variant="outline" size="sm"><FileText className="mr-2 h-4 w-4"/> Export Report</Button>
           </div>
         }
      />
      <DemoDataNotice />

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="REGISTERED SOURCES" value="12" context="+2 this month" icon={Database} tone="primary" trend={[3, 4, 4, 6, 7, 9, 12]} />
          <KpiCard label="MATCHED ENTITIES" value="48,260" context="86% harmony rate" icon={GitMerge} tone="cyan" trend={[20, 24, 29, 33, 38, 44, 48]} />
          <KpiCard label="ACTIVE CONFLICTS" value="186" context="+12 today" icon={TriangleAlert} tone="conflict" trend={[140, 150, 158, 160, 171, 174, 186]} />
          <KpiCard label="PENDING VERIFICATION" value="34" context="−5 since yesterday" icon={ShieldCheck} tone="saffron" trend={[45, 42, 40, 41, 39, 36, 34]} />
      </section>

      <section className="h-[600px] lg:h-[700px] -mx-4 md:-mx-6 mb-8 mt-4 border-y border-border">
         <IntelligenceWorkspace 
            inspector={<MapInspector parcelId={selectedParcel} />} 
            defaultInspectorOpen={false}
         >
            <MapEngine 
               onParcelSelect={setSelectedParcel}
               selectedParcelId={selectedParcel}
               activeLayers={activeLayers}
               className="h-full w-full"
            />
            <div className="absolute left-4 top-4 z-10">
               <LayerControl activeLayers={activeLayers} onChange={setActiveLayers} />
            </div>
            
            {/* Map Status Bar at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-border bg-background/80 px-4 py-1 text-[10px] text-muted-foreground backdrop-blur-md">
               <div className="flex items-center gap-4">
                  <span className="font-bold text-saffron">DATA: Synthetic Demo</span>
                  <span>FEATURES: {selectedParcel ? "1 selected" : "27 parcels"}</span>
                  <span>SOURCES: {Object.values(activeLayers).filter(Boolean).length} active</span>
               </div>
               <div className="flex items-center gap-4">
                  {selectedParcel && <span className="font-mono text-primary">SELECTED: {selectedParcel}</span>}
                  <span className="font-mono">ZOOM: 16.0</span>
               </div>
            </div>
         </IntelligenceWorkspace>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassPanel title="Priority Conflicts" meta={<Link to="/conflicts" className="text-xs text-primary">View all</Link>}>
           <ul className="space-y-2">
              <li className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                 <div>
                    <div className="flex items-center gap-2"><span className="font-mono text-muted-foreground text-xs">CF-1043</span><StatusBadge label="Critical" variant="conflict" /></div>
                    <p className="mt-1 font-medium text-ivory">Overlap 118 m² (Revenue ↔ Revenue)</p>
                 </div>
                 <Button size="sm" variant="outline">Review</Button>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                 <div>
                    <div className="flex items-center gap-2"><span className="font-mono text-muted-foreground text-xs">CF-1042</span><StatusBadge label="High" variant="warning" /></div>
                    <p className="mt-1 font-medium text-ivory">Boundary Difference (Revenue ↔ Municipal)</p>
                 </div>
                 <Button size="sm" variant="outline">Review</Button>
              </li>
           </ul>
        </GlassPanel>

        <GlassPanel title="Source Quality">
           <ul className="grid gap-2 sm:grid-cols-2">
            {sources.map(([n, c, u, s, a]) => (
              <li key={n as string} className="flex flex-col gap-1 rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" aria-hidden />
                  <p className="truncate text-sm font-semibold text-ivory">{n}</p>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                   <span>{a} Authority</span>
                   <StatusBadge label={s as string} variant={s === "Ready" ? "verified" : s === "Processing" ? "processing" : "warning"} />
                </div>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

       <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <GlassPanel title="Verification Status">
           <div className="space-y-4 pt-2">
              <div>
                 <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Ready for Review</span><span className="font-mono text-ivory">24</span></div>
                 <Progress value={70} className="h-1.5" />
              </div>
              <div>
                 <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Changes Proposed</span><span className="font-mono text-ivory">8</span></div>
                 <Progress value={20} className="h-1.5" />
              </div>
              <div>
                 <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Returned for Evidence</span><span className="font-mono text-ivory">2</span></div>
                 <Progress value={10} className="h-1.5" />
              </div>
           </div>
        </GlassPanel>

        <GlassPanel title="Processing Jobs">
          <ul className="space-y-4">
            {jobs.map((j) => (
              <li key={j.n}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ivory">{j.n}</span>
                  <StatusBadge label={j.state} variant={j.state === "Completed" ? "verified" : j.state === "Queued" ? "muted" : "processing"} pulse={j.state === "Processing"} />
                </div>
                <p className="text-xs text-muted-foreground">{j.s}{j.state === "Processing" && ` · ${j.p}%`}</p>
                <Progress value={j.p} className={cn("mt-2 h-1", j.state === "Processing" && "shimmer")} />
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      <footer className="liquid-glass flex flex-wrap items-center justify-between gap-2 rounded-2xl p-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />Helpdesk (demo): 1800-000-0000 · Mon–Sat 9:30–18:00</span>
        <span>Demo environment — not an official government record.</span>
      </footer>
    </PageWrapper>
  );
}

