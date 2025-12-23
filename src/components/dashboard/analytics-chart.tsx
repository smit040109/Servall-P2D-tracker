"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { AnalyticsData } from "@/lib/types"

export default function AnalyticsChart({ data }: { data: AnalyticsData['leadsOverTime'] }) {
  const chartConfig = {
    leads: {
      label: "Leads",
      color: "hsl(var(--secondary-foreground))",
    },
    encashed: {
      label: "Encashed",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads vs Encashed</CardTitle>
        <CardDescription>A comparison of leads generated and successfully encashed over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 6)}
            />
             <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="leads" fill={chartConfig.leads.color} radius={4} />
            <Bar dataKey="encashed" fill={chartConfig.encashed.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
