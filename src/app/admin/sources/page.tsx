
import { PlacesTable } from "@/components/admin/places-table";
import { getPlaces } from "@/lib/data";

export default async function SourcesPage() {
    const sources = await getPlaces();
    return (
        <div>
            <PlacesTable places={sources} />
        </div>
    );
}

