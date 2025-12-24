'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Car, Loader2 } from 'lucide-react';
import React from 'react';
import Logo from '@/components/logo';
import { useSearchParams } from 'next/navigation';
import { createLead } from '@/lib/actions';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  vehicle: z.string().min(2, { message: 'Vehicle model must be at least 2 characters.' }),
});

// This page will be available at /campaign/[campaignId]
export default function CampaignLeadCapturePage({ params }: { params: { campaignId: string } }) {
  const searchParams = useSearchParams();
  const sourceId = searchParams.get('sourceId');

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      vehicle: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    if (!sourceId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Missing tracking information from QR code."
        });
        setIsSubmitting(false);
        return;
    }

    const leadData = { 
      ...values, 
      campaignId: params.campaignId, 
      sourceId: sourceId
    };

    console.log("Submitting lead:", leadData);
    const result = await createLead(leadData);

    if (result.success) {
        console.log("Lead saved to Firestore");
        toast({
            title: 'Success!',
            description: 'Your details have been submitted. Our team will contact you shortly.',
        });
        form.reset();
    } else {
         toast({
            variant: "destructive",
            title: "Submission Failed",
            description: result.message || "Could not save your details. Please try again.",
        });
    }
    
    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full mb-4 w-fit">
            <Car className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Claim Your Offer</CardTitle>
          <CardDescription>Enter your details below to receive an exclusive offer for your vehicle service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9876543210" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Toyota Camry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit & Get Offer'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Powered by Servall P2D
      </p>
    </main>
  );
}
