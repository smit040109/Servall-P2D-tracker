import AnalyticsCards from "@/components/dashboard/analytics-cards";
import LeadManagement from "@/components/branch/lead-management";
import { getBranchAnalytics } from "@/lib/data";

export default async function BranchDashboardPage() {
    // In a real app, branchId would come from user session
    const analytics = await getBranchAnalytics("fran_1");

    return (
        <div className="space-y-6">
            <AnalyticsCards 
                totalScans={analytics.totalScans}
                totalLeads={analytics.totalLeads}
                successfullyEncashed={analytics.successfullyEncashed}
            />
            <LeadManagement />
        </div>
    );
}
