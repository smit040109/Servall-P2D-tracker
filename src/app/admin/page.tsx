import AnalyticsCards from "@/components/dashboard/analytics-cards";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import { getAdminAnalytics } from "@/lib/data";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-6">
      <AnalyticsCards 
        totalScans={analytics.totalScans}
        totalLeads={analytics.totalLeads}
        successfullyEncashed={analytics.successfullyEncashed}
      />
      <AnalyticsChart data={analytics.leadsOverTime} />
    </div>
  );
}
