
import { PlacesTable } from "@/components/admin/places-table";
import { getPlacesWithStats } from "@/lib/data";

export default async function PlacesPage() {
    const places = await getPlacesWithStats();
    return (
        <div>
            <PlacesTable places={places} />
        </div>
    );
}
