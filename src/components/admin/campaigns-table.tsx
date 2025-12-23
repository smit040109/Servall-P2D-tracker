"use client"

import * as React from "react"
import Image from "next/image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, PlusCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import type { Campaign } from "@/lib/types"

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const [open, setOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  async function handleCreateCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCreating(false);
    setOpen(false);
    // In a real app, you would revalidate the data here.
  }

  const getQrCodeUrl = (campaignUrl: string) => {
    // In a real app, this should be an absolute URL. For prototyping,
    // we'll use the current window location if available.
    const siteUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://your-app-domain.com'; // Fallback for server rendering
    const fullUrl = `${siteUrl}${campaignUrl}`;
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullUrl)}&size=256x256&bgcolor=ffffff`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Campaigns</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Fill in the details to generate a new campaign QR code.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" placeholder="e.g. Summer Sale" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right">
                  Branch
                </Label>
                <Select required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="koramangala">Koramangala</SelectItem>
                    <SelectItem value="indiranagar">Indiranagar</SelectItem>
                    <SelectItem value="hsr">HSR Layout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <Button type="submit" disabled={isCreating}>
                 {isCreating ? <Loader2 className="animate-spin"/> : "Generate QR Code"}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Scans</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Encashed</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.branch}</TableCell>
                <TableCell className="text-right">{campaign.scans.toLocaleString()}</TableCell>
                <TableCell className="text-right">{campaign.leads.toLocaleString()}</TableCell>
                <TableCell className="text-right">{campaign.encashed.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{campaign.name} - QR Code</DialogTitle>
                      </DialogHeader>
                      <div className="p-4 flex items-center justify-center bg-white rounded-md">
                         <Image 
                           src={getQrCodeUrl(campaign.qrCodeUrl)}
                           width={256}
                           height={256}
                           alt={`QR Code for ${campaign.name}`}
                         />
                      </div>
                      <p className="text-center text-sm text-muted-foreground">Scan this code to capture leads for the {campaign.branch} branch.</p>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
