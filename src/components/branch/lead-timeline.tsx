"use client";

import type { TimelineEvent } from "@/lib/types";
import { CheckCircle, FilePenLine, Send } from "lucide-react";
import { format } from "date-fns";

type LeadTimelineProps = {
  timeline: TimelineEvent[];
};

export function LeadTimeline({ timeline = [] }: LeadTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">No timeline events found.</p>;
  }

  // Sort events by timestamp, newest first
  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime());

  const getIcon = (event: TimelineEvent['event']) => {
    switch(event) {
        case 'Form Submitted':
            return <FilePenLine className="h-5 w-5 text-blue-500" />;
        case 'Offer Encashed':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Feedback Request Sent':
            return <Send className="h-5 w-5 text-purple-500" />;
        default:
            return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  }

  return (
    <div className="space-y-6 p-4">
      {sortedTimeline.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background ring-2 ring-primary/50">
              {getIcon(item.event)}
            </span>
            {index < sortedTimeline.length - 1 && (
              <div className="w-px flex-1 bg-border -mt-1" />
            )}
          </div>
          <div className="flex-1 pb-2">
            <p className="font-semibold text-sm">{item.event}</p>
            <p className="text-xs text-muted-foreground">
              by {item.source}
            </p>
            <time className="text-xs text-muted-foreground/80 mt-1">
              {format(new Date(item.timestamp as string), "PPp")}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
}
