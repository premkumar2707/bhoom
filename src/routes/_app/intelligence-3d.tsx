import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Layers, MousePointer2, Map as MapIcon, Maximize } from "lucide-react";
import { PageHeader, Panel } from "@/components/common/ModulePage";
import { DemoDataNotice } from "@/components/common/TrustBadge";
import { IntelligenceWorkspace } from "@/components/ui/IntelligenceWorkspace";
import { EmptyState } from "@/components/ui/bhumitra";

export const Route = createFileRoute("/_app/intelligence-3d")({
  head: () => ({
    meta: [
      { title: "3D Intelligence — BHOO-MITRA AI" },
      { name: "description", content: "3D spatial visualization and volumetric analysis." },
      { property: "og:title", content: "3D Intelligence — BHOO-MITRA AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Intelligence3DPage,
});

function Intelligence3DPage() {
  const inspector = (
     <div className="space-y-4">
        <Panel title="Layers">
           <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><input type="checkbox" checked disabled className="accent-[var(--cyan)]" /> 3D Buildings (LOD2)</li>
              <li className="flex items-center gap-2"><input type="checkbox" checked disabled className="accent-[var(--cyan)]" /> Terrain (DTM)</li>
              <li className="flex items-center gap-2"><input type="checkbox" disabled className="accent-[var(--cyan)]" /> Point Cloud Survey</li>
              <li className="flex items-center gap-2"><input type="checkbox" disabled className="accent-[var(--cyan)]" /> Drone Photogrammetry mesh</li>
           </ul>
        </Panel>

        <Panel title="Analysis Tools">
           <EmptyState icon={MousePointer2} title="Select a tool" description="3D measurement tools will be available here." className="py-8 border-none" />
        </Panel>
        
        <div className="rounded-md border border-saffron/40 bg-saffron/10 p-3 text-xs text-saffron">
           <p className="font-bold">COMING NEXT</p>
           <p className="mt-1">CesiumJS engine integration for interactive 3D.</p>
        </div>
     </div>
  );

  return (
    <div className="flex h-full flex-col">
       <div className="shrink-0 p-4 border-b border-border bg-background/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Box className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-ivory">3D Intelligence</h2>
                <span className="ml-2 rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">Interactive parcel and building relationship analysis</span>
             </div>
             
             {/* 2D/3D ViewMode Toggle */}
             <div className="flex items-center rounded-md border border-border bg-surface p-0.5">
                <Link to="/overview" className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-ivory transition-colors">
                   <MapIcon className="h-3.5 w-3.5" /> 2D Map
                </Link>
                <div className="flex items-center gap-2 rounded bg-background px-3 py-1.5 text-xs font-bold text-ivory shadow-sm border border-border/50">
                   <Box className="h-3.5 w-3.5 text-primary" /> 3D Scene
                </div>
             </div>
          </div>
       </div>
       
       <IntelligenceWorkspace inspector={inspector} className="h-auto flex-1">
          <div className="flex h-full flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-[#0a0f18] spatial-grid">
             {/* Abstract 3D CSS Preview */}
             <div className="relative w-64 h-64 perspective-[1000px] mb-8" aria-hidden>
                <div className="absolute inset-0 preserve-3d rotate-x-[60deg] rotate-z-[45deg] transition-transform duration-1000 hover:rotate-z-[60deg]">
                   {/* Ground / Parcel */}
                   <div className="absolute inset-0 border-2 border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--cyan),0.2)]" />
                   {/* Grid on parcel */}
                   <div className="absolute inset-0 spatial-grid opacity-50" />
                   
                   {/* Abstract Building */}
                   <div className="absolute bottom-8 left-8 right-16 h-32 preserve-3d">
                      {/* Top */}
                      <div className="absolute inset-x-0 top-0 h-24 border border-cyan/50 bg-cyan/20 -translate-z-32 transform-style-3d shadow-lg" style={{ transform: "translateZ(64px)" }} />
                      {/* Front */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 border border-cyan/50 bg-cyan/10 origin-bottom" style={{ transform: "rotateX(-90deg)" }} />
                      {/* Right */}
                      <div className="absolute bottom-0 right-0 top-0 w-16 border border-cyan/50 bg-cyan/15 origin-right" style={{ transform: "rotateY(-90deg)" }} />
                   </div>
                </div>
             </div>
             
             <p className="label-technical text-primary drop-shadow-md">3D WORKSPACE PLACEHOLDER</p>
             <p className="max-w-sm text-sm text-muted-foreground mt-2">
               This view will render high-fidelity CesiumJS 3D tiles, building models, and terrain data.
             </p>
             
             {/* Fake controls overlay */}
             <div className="absolute left-4 top-4 flex flex-col gap-2">
                <button className="rounded-md border border-border bg-background/60 p-2 text-muted-foreground backdrop-blur-md shadow-sm hover:text-ivory hover:bg-white/5 transition-colors" title="View 2D">
                   <MapIcon className="h-4 w-4" />
                </button>
                <button className="rounded-md border border-primary/50 bg-primary/10 p-2 text-primary backdrop-blur-md shadow-sm" title="View 3D">
                   <Box className="h-4 w-4" />
                </button>
             </div>
             
             <div className="absolute right-4 bottom-4">
                <button className="rounded-md border border-border bg-background/60 p-2 text-muted-foreground backdrop-blur-md shadow-sm hover:text-ivory hover:bg-white/5 transition-colors" title="Fullscreen">
                   <Maximize className="h-4 w-4" />
                </button>
             </div>
          </div>
       </IntelligenceWorkspace>
    </div>
  );
}
