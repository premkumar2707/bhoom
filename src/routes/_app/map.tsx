import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const GeoWorkspace = lazy(() => import("@/components/map/GeoWorkspace"));

export const Route = createFileRoute("/_app/map")({
  head: () => ({
    meta: [
      { title: "Geospatial Workspace — BhuSetu" },
      { name: "description", content: "Explore parcels, buildings, survey points and terrain across sources in 2D and 3D." },
      { property: "og:title", content: "Geospatial Workspace — BhuSetu" },
      { property: "og:description", content: "Compare how different sources represent the same land." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function Fallback() {
  return <div className="flex h-[70dvh] items-center justify-center spatial-grid text-sm text-muted-foreground">Preparing spatial workspace…</div>;
}

function MapPage() {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <GeoWorkspace />
      </Suspense>
    </ClientOnly>
  );
}
