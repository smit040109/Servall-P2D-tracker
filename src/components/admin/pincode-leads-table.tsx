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
import type { PincodeLead } from "@/lib/types"

export function PincodeLeadsTable({ data }: { data: PincodeLead[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads by Pincode</CardTitle>
        <CardDescription>Total leads generated from each pincode.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pincode</TableHead>
              <TableHead className="text-right">Total Leads</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.pincode}>
                <TableCell className="font-medium">{item.pincode}</TableCell>
                <TableCell className="text-right">{item.leads.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
