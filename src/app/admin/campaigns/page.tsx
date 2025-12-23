import { CampaignsTable } from "@/components/admin/campaigns-table";
import { getCampaigns } from "@/lib/data";

export default async function CampaignsPage() {
    const campaigns = await getCampaigns();
    return (
        <div>
            <CampaignsTable campaigns={campaigns} />
        </div>
    );
}
