
"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import type { Lead } from "@/lib/types"
import { Badge } from "../ui/badge"
import { format } from "date-fns"

export function LeadsTable({ leads }: { leads: Lead[] }) {

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'encashed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Encashed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Leads</CardTitle>
        <CardDescription>A list of all leads captured across all campaigns.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.vehicle}</TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell>{format(new Date(lead.createdAt as string), 'PP')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
