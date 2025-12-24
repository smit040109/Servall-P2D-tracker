"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, User, Phone, Car, Clock, BadgeCheck, BadgeX, BadgeHelp, FileClock, MapPin } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { getLeadByPhone } from '@/lib/data';
import { Badge } from '../ui/badge';
import { OtpDialog } from './otp-dialog';
import { format } from 'date-fns';
import { updateLeadStatus } from '@/lib/actions';
import { LeadTimeline } from './lead-timeline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const staffUser = {
  name: "Branch User",
};


export default function LeadManagement() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const handleSearch = async () => {
    if (phone.length !== 10) {
      setLead(null); // Explicitly set to null for "not found"
      return;
    }
    setIsLoading(true);
    setLead(undefined); // Set to undefined for loading state
    const foundLead = await getLeadByPhone(phone);
    setLead(foundLead || null);
    setIsLoading(false);
  };

  const handleVerified = async () => {
    if (lead) {
      const result = await updateLeadStatus(lead.id, lead.phone, 'encashed', staffUser.name);
      if (result.success) {
        // Refetch the lead to get the updated timeline
        const updatedLead = await getLeadByPhone(phone);
        setLead(updatedLead || null);
      }
    }
  };

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'encashed':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><BadgeCheck className="mr-1 h-4 w-4"/>Encashed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><BadgeHelp className="mr-1 h-4 w-4"/>Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><BadgeX className="mr-1 h-4 w-4"/>Rejected</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Lookup & Encashment</CardTitle>
        <CardDescription>Enter customer's phone number to retrieve their details and encash their offer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input 
            type="tel" 
            placeholder="Enter 10-digit phone number" 
            value={phone} 
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading || phone.length !== 10}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </Button>
        </div>

        {lead === undefined && isLoading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {lead === null && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No lead found for this phone number.</p>
          </div>
        )}

        {lead && (
          <Card className="bg-secondary/50">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2"><User /> {lead.name}</CardTitle>
                    <CardDescription>Lead Details</CardDescription>
                  </div>
                  {getStatusBadge(lead.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> <span>{lead.phone}</span></div>
                    <div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /> <span>{lead.vehicle}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> <span>{format(new Date(lead.createdAt as string), "PPP")}</span></div>
                    {lead.pincode && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> <span>{lead.pincode}</span></div>}
                </div>
                {lead.status === 'pending' && (
                    <div className="mt-4">
                        <Button className="w-full" onClick={() => setIsOtpOpen(true)}>
                            Verify & Encash Offer
                        </Button>
                    </div>
                )}
                 <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <FileClock className="h-4 w-4" />
                        View Customer Journey
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <LeadTimeline timeline={lead.timeline} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
        )}
        <OtpDialog open={isOtpOpen} onOpenChange={setIsOtpOpen} onVerified={handleVerified} />
      </CardContent>
    </Card>
  );
}
