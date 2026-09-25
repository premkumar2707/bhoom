import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { municipalData, registryData, surveyData } from "@/lib/mock/geo-data";
import { cn } from "@/lib/utils";

// Standard dark matter style (Carto) or a basic dark style
const MAP_STYLE = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, © CARTO'
    }
  },
  layers: [
    {
      id: "base-map",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 22
    }
  ]
};

import { type ActiveLayers } from "./LayerControl";

interface MapEngineProps {
  className?: string;
  onParcelSelect?: (parcelId: string | null) => void;
  selectedParcelId?: string | null;
  activeLayers?: ActiveLayers | Record<string, boolean>;
  confidenceMode?: boolean;
}

export function MapEngine({
  className,
  onParcelSelect,
  selectedParcelId,
  activeLayers = {
    municipal: true,
    registry: true,
    survey: true,
  },
  confidenceMode = false,
}: MapEngineProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE as any,
      center: [77.202, 28.601], // New Delhi area where mock data is
      zoom: 16,
      pitch: 0,
      maxZoom: 22,
    });

    map.current.on("load", () => {
       const m = map.current!;
       
       // Add sources
       m.addSource("municipal-source", { type: "geojson", data: municipalData, generateId: true });
       m.addSource("registry-source", { type: "geojson", data: registryData, generateId: true });
       m.addSource("survey-source", { type: "geojson", data: surveyData, generateId: true });

       // Define colors based on mode (standard vs confidence)
       // Standard colors
       const colors = {
          municipal: "#00ffff", // Cyan
          registry: "#a78bfa", // Purple
          survey: "#fbbf24", // Amber
       };

       // Add municipal layers
       m.addLayer({
          id: "municipal-fill",
          type: "fill",
          source: "municipal-source",
          paint: {
             "fill-color": colors.municipal,
             "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.3, 0.1]
          }
       });
       m.addLayer({
          id: "municipal-line",
          type: "line",
          source: "municipal-source",
          paint: {
             "line-color": colors.municipal,
             "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3, 1]
          }
       });

       // Add registry layers
       m.addLayer({
          id: "registry-fill",
          type: "fill",
          source: "registry-source",
          paint: {
             "fill-color": colors.registry,
             "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.3, 0.1]
          }
       });
       m.addLayer({
          id: "registry-line",
          type: "line",
          source: "registry-source",
          paint: {
             "line-color": colors.registry,
             "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3, 1],
             "line-dasharray": [2, 2]
          }
       });

       // Add survey layers
       m.addLayer({
          id: "survey-fill",
          type: "fill",
          source: "survey-source",
          paint: {
             "fill-color": colors.survey,
             "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.3, 0.1]
          }
       });
       m.addLayer({
          id: "survey-line",
          type: "line",
          source: "survey-source",
          paint: {
             "line-color": colors.survey,
             "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 3, 1],
             "line-dasharray": [4, 4]
          }
       });

       setLoaded(true);
    });

    // Handle clicks and hovers
    let hoveredStateId: string | number | null = null;
    let hoveredSource: string | null = null;

    const layers = ["municipal-fill", "registry-fill", "survey-fill"];

    layers.forEach((layer) => {
       const source = layer.split("-")[0] + "-source";
       
       map.current?.on("mousemove", layer, (e) => {
          if (e.features && e.features.length > 0) {
             const m = map.current!;
             m.getCanvas().style.cursor = "pointer";
             
             if (hoveredStateId !== null && hoveredSource !== null) {
                m.setFeatureState({ source: hoveredSource, id: hoveredStateId }, { hover: false });
             }
             const featId = e.features[0]?.id;
             hoveredStateId = (featId as string | number) ?? null;
             hoveredSource = source;
             if (featId !== undefined) {
                m.setFeatureState({ source: hoveredSource, id: featId }, { hover: true });
             }
          }
       });

       map.current?.on("mouseleave", layer, () => {
          const m = map.current!;
          m.getCanvas().style.cursor = "";
          if (hoveredStateId !== null && hoveredSource !== null) {
             m.setFeatureState({ source: hoveredSource, id: hoveredStateId }, { hover: false });
          }
          hoveredStateId = null;
          hoveredSource = null;
       });

       map.current?.on("click", layer, (e) => {
           if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const props = feature?.properties;
              if (onParcelSelect && props) {
                 onParcelSelect(props["id"] as string);
              }
           }
       });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Handle layer visibility based on activeLayers prop
  useEffect(() => {
     if (!loaded || !map.current) return;
     const m = map.current;
     
     const toggleLayer = (prefix: string, visible: boolean) => {
        const v = visible ? "visible" : "none";
        if (m.getLayer(`${prefix}-fill`)) m.setLayoutProperty(`${prefix}-fill`, "visibility", v);
        if (m.getLayer(`${prefix}-line`)) m.setLayoutProperty(`${prefix}-line`, "visibility", v);
     };

     toggleLayer("municipal", (activeLayers["municipal"] as boolean | undefined) ?? true);
     toggleLayer("registry", (activeLayers["registry"] as boolean | undefined) ?? true);
     toggleLayer("survey", (activeLayers["survey"] as boolean | undefined) ?? true);
     
  }, [activeLayers, loaded]);

  return (
    <div className={cn("relative h-full w-full bg-[#0a0f18]", className)}>
       <div ref={mapContainer} className="absolute inset-0 z-0" />
       {!loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0f18]/80 backdrop-blur-sm">
             <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
             <p className="mt-2 text-sm text-primary font-mono">Initializing Spatial Engine...</p>
          </div>
       )}
    </div>
  );
}
