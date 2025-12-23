import { DiscountsTable } from "@/components/admin/discounts-table";
import { getDiscounts } from "@/lib/data";

export default async function DiscountsPage() {
    const discounts = await getDiscounts();
    return (
        <div>
            <DiscountsTable discounts={discounts} />
        </div>
    );
}
