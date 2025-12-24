
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Loader2, Trash2, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import type { PlaceWithStats } from "@/lib/types"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "@/hooks/use-toast"
import { createPlace, deletePlace } from "@/lib/actions"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"

type DateRange = {
    from: Date | undefined,
    to: Date | undefined
}

export function PlacesTable({ places }: { places: PlaceWithStats[] }) {
  const [open, setOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const { toast } = useToast();
  const [dateRange, setDateRange] = React.useState<DateRange>({ from: undefined, to: undefined });


  const placeCategories = [
    'Salon', 'Gym', 'Local Shop', 'Dance Class', 'Theatre', 
    'Apartment', 'Mall', 'Parking Plot', 'Famous Place', 'Custom'
  ];

  const placementTypes = ['Poster', 'Standee', 'Counter', 'Banner', 'Custom'];


  async function handleCreatePlace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);

    const formData = new FormData(event.currentTarget);
    formData.append('startDate', dateRange.from?.toISOString() ?? '');
    formData.append('endDate', dateRange.to?.toISOString() ?? '');

    const result = await createPlace(formData);

    if (result.success) {
      toast({ title: "Success!", description: result.message });
      setOpen(false);
      setDateRange({ from: undefined, to: undefined }); // Reset date
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    
    setIsCreating(false);
  }

  async function handleRemovePlace(placeId: string) {
    const result = await deletePlace(placeId);
    if (result.success) {
      toast({ title: "Success!", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Place-wise ROI</CardTitle>
        <CardDescription>Track costs and return on investment for each marketing place.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add New Place
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                <DialogTitle>Add New Place</DialogTitle>
                <DialogDescription>
                    Add a new marketing place/sub-location to track its cost and ROI.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePlace} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="e.g. ABC Salon" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="category">Category</Label>
                            <Select required name="category">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {placeCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="monthlyCost">Monthly Cost (₹)</Label>
                            <Input id="monthlyCost" name="monthlyCost" type="number" placeholder="e.g. 2000" required />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="placementType">Placement Type</Label>
                            <Select required name="placementType">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {placementTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Placement Duration</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !dateRange.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date range</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange.from}
                                    selected={{ from: dateRange.from, to: dateRange.to }}
                                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                <Button type="submit" disabled={isCreating} className="mt-4">
                    {isCreating ? <Loader2 className="animate-spin"/> : "Add Place"}
                </Button>
                </form>
            </DialogContent>
            </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Place Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cost (₹)</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Encashed</TableHead>
              <TableHead className="text-right">Cost/Lead (₹)</TableHead>
              <TableHead className="text-right">Cost/Encash (₹)</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {places.map((place) => (
              <TableRow key={place.id}>
                <TableCell className="font-medium">{place.name} <span className="text-muted-foreground text-xs block">{place.placementType}</span></TableCell>
                <TableCell><Badge variant="secondary">{place.category}</Badge></TableCell>
                <TableCell className="text-right">₹{place.monthlyCost.toLocaleString()}</TableCell>
                <TableCell className="text-right">{place.totalLeads.toLocaleString()}</TableCell>
                <TableCell className="text-right">{place.totalEncashed.toLocaleString()}</TableCell>
                <TableCell className="text-right">{place.costPerLead.toFixed(2)}</TableCell>
                <TableCell className="text-right text-primary font-semibold">{place.costPerEncashment.toFixed(2)}</TableCell>
                <TableCell className="text-center">
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
                          This action cannot be undone. This will permanently delete this place.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemovePlace(place.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
