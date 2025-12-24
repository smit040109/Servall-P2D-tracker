"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, User, Phone, Car, Clock, BadgeCheck, BadgeX, BadgeHelp, FileClock, MapPin, Star, MessageSquareQuote, CheckSquare, Send } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { getLeadByPhone } from '@/lib/data';
import { Badge } from '../ui/badge';
import { OtpDialog } from './otp-dialog';
import { format } from 'date-fns';
import { updateLeadStatus } from '@/lib/actions';
import { LeadTimeline } from './lead-timeline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const staffUser = {
  name: "Branch User",
};


export default function LeadManagement() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const { toast } = useToast();
  
  // Local state for feedback inputs
  const [feedbackScore, setFeedbackScore] = useState<string>("");
  const [googleReview, setGoogleReview] = useState<boolean>(false);


  const handleSearch = async () => {
    if (phone.length !== 10) {
      setLead(null); // Explicitly set to null for "not found"
      return;
    }
    setIsLoading(true);
    setLead(undefined); // Set to undefined for loading state
    const foundLead = await getLeadByPhone(phone);
    setLead(foundLead || null);
    
    // Reset feedback form when a new lead is loaded
    setFeedbackScore(foundLead?.feedbackScore?.toString() || "");
    setGoogleReview(foundLead?.googleReview || false);

    setIsLoading(false);
  };
  
  const handleUpdate = async (updates: Partial<Lead>) => {
      if (lead) {
          setIsLoading(true);
          const result = await updateLeadStatus(lead.id, lead.phone, staffUser.name, updates);
          if (result.success) {
              const updatedLead = await getLeadByPhone(phone);
              setLead(updatedLead || null);
              toast({ title: "Success", description: result.message });
          } else {
              toast({ variant: "destructive", title: "Error", description: result.message });
          }
          setIsLoading(false);
      }
  };

  const handleVerified = () => {
    handleUpdate({ status: 'encashed' });
  };
  
  const handleSendFeedbackRequest = () => {
    handleUpdate({ feedbackRequestSent: true });
  }

  const handleSaveFeedback = () => {
    if (!feedbackScore) {
        toast({
            variant: "destructive",
            title: "Missing Rating",
            description: "Please select a feedback score before saving.",
        });
        return;
    }
    handleUpdate({
        feedbackScore: feedbackScore ? parseInt(feedbackScore) : undefined,
        googleReview: googleReview
    });
  }

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
        <CardDescription>Enter customer's phone number to retrieve their details and manage their journey.</CardDescription>
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

        {lead === null && !isLoading && (
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
                        <Button className="w-full" onClick={() => setIsOtpOpen(true)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin"/> : 'Verify & Encash Offer'}
                        </Button>
                    </div>
                )}
                
                {lead.status === 'encashed' && (
                    <div className="space-y-4 pt-4">
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2"><MessageSquareQuote className="h-4 w-4" />Post-Visit Actions</h4>
                        
                        {!lead.feedbackRequestSent ? (
                            <Button variant="outline" size="sm" className="w-full" onClick={handleSendFeedbackRequest} disabled={isLoading}>
                               {isLoading ? <Loader2 className="animate-spin"/> : <><Send className="mr-2 h-4 w-4" /> Log Feedback Request Sent</>}
                            </Button>
                        ) : (
                           <div className="p-3 bg-background/50 rounded-md space-y-4">
                               <p className="text-xs text-green-600 font-medium flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Feedback request logged.</p>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="feedback-score" className="flex items-center gap-1 text-xs"><Star className="h-3 w-3" /> Feedback Score</Label>
                                    <Select value={feedbackScore} onValueChange={setFeedbackScore} disabled={!!lead.feedbackScore || isLoading}>
                                      <SelectTrigger id="feedback-score">
                                        <SelectValue placeholder="Rate 1-5" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">1 - Poor</SelectItem>
                                        <SelectItem value="2">2 - Fair</SelectItem>
                                        <SelectItem value="3">3 - Good</SelectItem>
                                        <SelectItem value="4">4 - Very Good</SelectItem>
                                        <SelectItem value="5">5 - Excellent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2 pt-6">
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="google-review" checked={googleReview} onCheckedChange={(checked) => setGoogleReview(checked as boolean)} disabled={!!lead.googleReview || isLoading}/>
                                        <Label htmlFor="google-review" className="text-xs">Left Google Review?</Label>
                                    </div>
                                  </div>
                               </div>
                                {!lead.feedbackScore && <Button size="sm" className="w-full" onClick={handleSaveFeedback} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin"/> : 'Save Feedback'}
                                </Button>}
                           </div>
                        )}
                      </div>
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
