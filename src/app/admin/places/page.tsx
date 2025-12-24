
import { PlacesTable } from "@/components/admin/places-table";
import { getPlaces } from "@/lib/data";

export default async function PlacesPage() {
    const places = await getPlaces();
    return (
        <div>
            <PlacesTable places={places} />
        </div>
    );
}
