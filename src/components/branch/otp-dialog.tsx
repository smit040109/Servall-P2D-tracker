"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type OtpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
};

export function OtpDialog({ open, onOpenChange, onVerified }: OtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }
    
    setIsVerifying(true);
    // Simulate API call for OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otp === '123456') { // Mock success OTP
      toast({
        title: 'Success',
        description: 'Lead has been successfully encashed.',
        variant: 'default',
      });
      onVerified();
      onOpenChange(false);
      setOtp('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
    setIsVerifying(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogDescription>
            An OTP has been sent to the customer's phone. Please enter it below to verify.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <Input
            type="tel"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-center text-lg tracking-[0.5em]"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="button" className="w-full" onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? <Loader2 className="animate-spin" /> : 'Verify & Encash'}
          </Button>
          <Button variant="link" size="sm" disabled={isVerifying}>
            Resend OTP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
