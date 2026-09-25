import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers, Map, ShieldCheck, Workflow } from "lucide-react";
import { BhuSetuLogo } from "@/components/brand/BhuSetuLogo";
import { SpatialVisual } from "@/components/spatial/SpatialVisual";
import { Button } from "@/components/ui/button";
import { DemoDataNotice } from "@/components/common/TrustBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BhuSetu — One spatial truth, built from many sources" },
      {
        name: "description",
        content:
          "BhuSetu bridges cadastral records, municipal GIS, imagery and survey data into one verifiable spatial register for land administration teams.",
      },
      { property: "og:title", content: "BhuSetu — One spatial truth, built from many sources" },
      {
        property: "og:description",
        content:
          "Intelligent land record harmonization and geospatial intelligence, designed for official land administration workflows.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const pillars = [
  {
    icon: Layers,
    title: "Fragmented sources, one register",
    body: "Cadastral sheets, municipal GIS layers, imagery and survey points aligned into a single spatial view.",
  },
  {
    icon: Workflow,
    title: "Transparent harmonization",
    body: "Every reconciliation step records its inputs, method and confidence so officers can follow the reasoning.",
  },
  {
    icon: ShieldCheck,
    title: "Human verification first",
    body: "Automated candidates are proposals. An officer confirms before anything becomes a harmonized record.",
  },
];

function Landing() {
  return (
    <div className="spatial-atmosphere min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <BhuSetuLogo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/map">Geospatial map</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/overview">
                Open workspace <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <SpatialVisual className="absolute inset-0 h-full w-full" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <p className="label-technical">Land Intelligence Platform</p>
            <h1 className="mt-4 font-display text-[2.25rem] leading-[1.05] font-extrabold text-ivory sm:text-5xl lg:text-6xl">
              One spatial truth.
              <br />
              <span className="text-gradient-brand">Built from many sources.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/75">
              BhuSetu is a bridge between fragmented land information — cadastral records,
              municipal GIS, imagery and field surveys — producing harmonized, traceable and
              verifiable spatial records for land administration teams.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/overview">
                  Open workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/map">
                  <Map className="mr-2 h-4 w-4" /> Explore spatial view
                </Link>
              </Button>
            </div>
          </div>

          <dl className="grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8 md:grid-cols-4">
            {[
              ["Source registers", "04"],
              ["Parcels indexed", "18.2k"],
              ["Open conflicts", "07"],
              ["Awaiting review", "03"],
            ].map(([label, value]) => (
              <div key={label}>
                <dd className="font-display text-2xl font-bold text-ivory">{value}</dd>
                <dt className="label-technical mt-1">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="panel-surface elevate-hover rounded-xl p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/25 bg-primary/10">
                <p.icon className="h-4.5 w-4.5 text-primary" />
              </span>
              <h2 className="mt-4 font-display text-base font-bold text-ivory">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>
        <DemoDataNotice className="mt-6" />
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center md:flex-row md:px-6 md:text-left">
          <BhuSetuLogo compact />
          <p className="text-xs text-muted-foreground">
            BhuSetu — Intelligent land record harmonization. Demo environment.
          </p>
        </div>
      </footer>
    </div>
  );
}
