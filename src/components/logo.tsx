import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xl font-bold text-foreground", className)}>
      <div className="p-1.5 bg-primary/20 text-primary rounded-lg">
        <Wrench className="h-5 w-5" />
      </div>
      <span className="font-headline">Servall P2D</span>
    </div>
  );
}
