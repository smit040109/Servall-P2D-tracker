import { BranchesTable } from "@/components/admin/branches-table";
import { getFranchises } from "@/lib/data";

export default async function BranchesPage() {
    const branches = await getFranchises();
    return (
        <div>
            <BranchesTable branches={branches} />
        </div>
    );
}
