
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import type { LocationLead } from "@/lib/types"
import { Badge } from "../ui/badge"

export function LocationLeadsTable({ data }: { data: LocationLead[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Location</CardTitle>
        <CardDescription>Total leads generated from each sub-location.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sub-Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total Leads</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.location}>
                <TableCell className="font-medium">{item.location}</TableCell>
                <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                <TableCell className="text-right">{item.leads.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
