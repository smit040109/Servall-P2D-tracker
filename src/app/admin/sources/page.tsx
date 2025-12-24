import { SourcesTable } from "@/components/admin/sources-table";
import { getSources } from "@/lib/data";

export default async function SourcesPage() {
    const sources = await getSources();
    return (
        <div>
            <SourcesTable sources={sources} />
        </div>
    );
}
