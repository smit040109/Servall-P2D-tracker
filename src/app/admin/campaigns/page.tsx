import { CampaignsTable } from "@/components/admin/campaigns-table";
import { getCampaigns, getFranchises, getDiscounts } from "@/lib/data";

export default async function CampaignsPage() {
    const [campaigns, branches, discounts] = await Promise.all([
        getCampaigns(),
        getFranchises(),
        getDiscounts()
    ]);

    return (
        <div>
            <CampaignsTable campaigns={campaigns} branches={branches} discounts={discounts} />
        </div>
    );
}
