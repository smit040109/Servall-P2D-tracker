
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, PlusCircle, Loader2, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import type { CampaignSource, Place, Campaign } from "@/lib/types"
import { Badge } from "../ui/badge"

type CampaignSourcesTableProps = {
    campaignSources: CampaignSource[],
    allPlaces: Place[],
    campaign: Campaign
}

export function CampaignSourcesTable({ campaignSources, allPlaces, campaign }: CampaignSourcesTableProps) {
  const [open, setOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  async function handleAddSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCreating(false);
    setOpen(false);
    // In a real app, you would revalidate the data here.
  }
  
  async function handleRemoveSource(campaignSourceId: string) {
    console.log("Removing source from campaign:", campaignSourceId);
    // In a real app, you would make an API call and revalidate data.
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const getPlaceDetails = (placeId: string) => allPlaces.find(p => p.id === placeId);

  const getQrCodeUrl = (campaignId: string, sourceId: string) => {
    // In a real app, this should be an absolute URL. For prototyping,
    // we'll use the current window location if available.
    const siteUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://your-app-domain.com'; // Fallback for server rendering
    const fullUrl = `${siteUrl}/campaign/${campaignId}?source=${sourceId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullUrl)}&size=256x256&bgcolor=ffffff`;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Offline Places</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Place to Campaign</DialogTitle>
              <DialogDescription>
                Select a place to generate a unique QR code for this campaign.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSource} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="source" className="text-right">
                  Place
                </Label>
                <Select required name="sourceId">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a place" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPlaces.map(place => (
                      <SelectItem key={place.id} value={place.id}>{place.name} ({place.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <Button type="submit" disabled={isCreating}>
                 {isCreating ? <Loader2 className="animate-spin"/> : "Add Place & Get QR"}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Place Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Scans</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Encashed</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignSources.map((cs) => {
              const place = getPlaceDetails(cs.sourceId);
              return (
              <TableRow key={cs.id}>
                <TableCell className="font-medium">{place?.name || 'Unknown'}</TableCell>
                <TableCell><Badge variant="outline">{place?.category || 'N/A'}</Badge></TableCell>
                <TableCell className="text-right">{cs.scans.toLocaleString()}</TableCell>
                <TableCell className="text-right">{cs.leads.toLocaleString()}</TableCell>
                <TableCell className="text-right">{cs.encashed.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{campaign.name} at {place?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="p-4 flex items-center justify-center bg-white rounded-md">
                           <Image 
                             src={getQrCodeUrl(cs.campaignId, cs.sourceId)}
                             width={256}
                             height={256}
                             alt={`QR Code for ${campaign.name}`}
                           />
                        </div>
                        <p className="text-center text-sm text-muted-foreground">Scan this code to track leads from {place?.name}.</p>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this place from the campaign.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveSource(cs.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
