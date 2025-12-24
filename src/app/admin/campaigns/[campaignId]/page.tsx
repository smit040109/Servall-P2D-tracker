
import { CampaignSourcesTable } from "@/components/admin/campaign-sources-table";
import { getCampaignById, getCampaignSources, getPlaces } from "@/lib/data";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CampaignDetailsPage({ params }: { params: { campaignId: string } }) {
    const campaign = await getCampaignById(params.campaignId);
    
    if (!campaign) {
        notFound();
    }

    const [campaignSources, allPlaces] = await Promise.all([
        getCampaignSources(campaign.id),
        getPlaces()
    ]);
    
    return (
        <div className="space-y-6">
            <Link href="/admin/campaigns">
                <Button variant="outline" size="sm" className="gap-1 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Campaigns
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>Manage sources and QR codes for this campaign.</CardDescription>
                    <div className="flex gap-2 pt-2">
                        <Badge variant="secondary">{campaign.city}</Badge>
                    </div>
                </CardHeader>
            </Card>
            
            <CampaignSourcesTable 
                campaignSources={campaignSources}
                allPlaces={allPlaces}
                campaign={campaign}
            />
        </div>
    );
}
