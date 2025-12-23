import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Users, BadgeCheck } from "lucide-react";

type AnalyticsCardsProps = {
  totalScans: number;
  totalLeads: number;
  successfullyEncashed: number;
}

export default function AnalyticsCards({ totalScans, totalLeads, successfullyEncashed }: AnalyticsCardsProps) {
  const stats = [
    { title: 'Total Scans', value: totalScans.toLocaleString(), icon: Gauge, color: 'text-blue-500' },
    { title: 'Total Leads', value: totalLeads.toLocaleString(), icon: Users, color: 'text-orange-500' },
    { title: 'Successfully Encashed', value: successfullyEncashed.toLocaleString(), icon: BadgeCheck, color: 'text-green-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
