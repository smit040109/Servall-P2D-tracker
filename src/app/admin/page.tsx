import AnalyticsCards from "@/components/dashboard/analytics-cards";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import { CategoryLeadsTable } from "@/components/admin/category-leads-table";
import { LocationLeadsTable } from "@/components/admin/location-leads-table";
import { PincodeLeadsTable } from "@/components/admin/pincode-leads-table";
import { getAdminAnalytics, getCategoryLeads, getLocationLeads, getPincodeLeads } from "@/lib/data";
import CustomerInsights from "@/components/admin/customer-insights";
import FirestoreTest from "@/components/admin/FirestoreTest";

export default async function AdminDashboardPage() {
  const [analytics, categoryLeads, locationLeads, pincodeLeads] = await Promise.all([
    getAdminAnalytics(),
    getCategoryLeads(),
    getLocationLeads(),
    getPincodeLeads(),
  ]);

  return (
    <div className="space-y-6">
      <FirestoreTest />
      <AnalyticsCards 
        totalScans={analytics.totalScans}
        totalLeads={analytics.totalLeads}
        successfullyEncashed={analytics.successfullyEncashed}
      />
      {analytics.customerStats && <CustomerInsights stats={analytics.customerStats} />}
      <AnalyticsChart data={analytics.leadsOverTime} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CategoryLeadsTable data={categoryLeads} />
        <LocationLeadsTable data={locationLeads} />
        <PincodeLeadsTable data={pincodeLeads} />
      </div>
    </div>
  );
}
