"use client";

import dynamic from "next/dynamic";
import type { Campaign, Place, CampaignSource } from "@/lib/types";

// Dynamically import the component that causes hydration issues
const CampaignSourcesTable = dynamic(
  () =>
    import("./campaign-sources-table").then((mod) => mod.CampaignSourcesTable),
  { ssr: false }
);

type CampaignSourcesTableProps = {
  campaignSources: CampaignSource[];
  allPlaces: Place[];
  campaign: Campaign;
};

export function CampaignSourcesTableDynamic(
  props: CampaignSourcesTableProps
) {
  return <CampaignSourcesTable {...props} />;
}
