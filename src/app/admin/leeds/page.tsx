
import { LeadsTable } from "@/components/admin/leads-table";
import { getAllLeads } from "@/lib/data";

export default async function LeadsPage() {
    const leads = await getAllLeads();
    console.log("Fetched leads:", leads.length);
    return (
        <div>
            <LeadsTable leads={leads} />
        </div>
    );
}
