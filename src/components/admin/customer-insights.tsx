import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Repeat, Percent } from "lucide-react";
import type { AnalyticsData } from "@/lib/types";

type CustomerInsightsProps = {
  stats: NonNullable<AnalyticsData['customerStats']>;
}

export default function CustomerInsights({ stats }: CustomerInsightsProps) {
  const repeatRate = stats.totalCustomers > 0 
    ? ((stats.repeatCustomers / stats.totalCustomers) * 100).toFixed(1)
    : "0.0";

  const insightStats = [
    { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: Users, color: 'text-purple-500' },
    { title: 'New Customers', value: stats.newCustomers.toLocaleString(), icon: UserPlus, color: 'text-sky-500' },
    { title: 'Repeat Customers', value: stats.repeatCustomers.toLocaleString(), icon: Repeat, color: 'text-amber-500' },
    { title: 'Repeat Rate', value: `${repeatRate}%`, icon: Percent, color: 'text-pink-500' },
  ];

  return (
    <div>
        <h2 className="text-xl font-semibold mb-4">Customer Insights</h2>
        <div className="grid gap-4 md:grid-cols-4">
        {insightStats.map((stat) => (
            <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">All-time data</p>
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  );
}
