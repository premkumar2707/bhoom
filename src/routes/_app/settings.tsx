import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/common/ModulePage";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BhuSetu" },
      {
        name: "description",
        content:
          "Workspace configuration: coordinate systems, confidence thresholds, roles and notification preferences.",
      },
      { property: "og:title", content: "Settings — BhuSetu" },
      {
        property: "og:description",
        content: "Coordinate systems, thresholds, roles and notification preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ModulePlaceholder
      eyebrow="Configuration"
      title="Settings"
      description="Workspace-level configuration for coordinate systems, harmonization thresholds, officer roles and notification delivery."
      icon={Settings}
      capabilities={[
        "Default CRS and tolerance configuration",
        "Confidence thresholds for auto-candidates",
        "Role and permission management",
        "Notification channels and quiet hours",
      ]}
    />
  ),
});
