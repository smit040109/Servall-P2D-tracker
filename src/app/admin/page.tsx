
import AnalyticsCards from "@/components/dashboard/analytics-cards";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import { CategoryLeadsTable } from "@/components/admin/category-leads-table";
import { LocationLeadsTable } from "@/components/admin/location-leads-table";
import { getAdminAnalytics, getCategoryLeads, getLocationLeads } from "@/lib/data";
import CustomerInsights from "@/components/admin/customer-insights";

export default async function AdminDashboardPage() {
  const [analytics, categoryLeads, locationLeads] = await Promise.all([
    getAdminAnalytics(),
    getCategoryLeads(),
    getLocationLeads()
  ]);

  return (
    <div className="space-y-6">
      <AnalyticsCards 
        totalScans={analytics.totalScans}
        totalLeads={analytics.totalLeads}
        successfullyEncashed={analytics.successfullyEncashed}
      />
      {analytics.customerStats && <CustomerInsights stats={analytics.customerStats} />}
      <AnalyticsChart data={analytics.leadsOverTime} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryLeadsTable data={categoryLeads} />
        <LocationLeadsTable data={locationLeads} />
      </div>
    </div>
  );
}
