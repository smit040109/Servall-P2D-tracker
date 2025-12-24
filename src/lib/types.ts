import { FieldValue } from "firebase/firestore";

export type Campaign = {
  id: string;
  name: string;
  city: string;
  branchId: string;
  discountId: string;
  startDate?: string | FieldValue;
  endDate?: string | FieldValue;
  status: "active" | "paused" | "completed";
  createdAt?: string | FieldValue;
};

export type TimelineEvent = {
  event: 'Form Submitted' | 'Offer Encashed' | 'Status Update' | 'Feedback Request Sent';
  timestamp: string | FieldValue;
  source: string; // e.g., 'System', 'Branch User', 'Admin User'
  notes?: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  pincode?: string;
  status: 'pending' | 'encashed' | 'rejected';
  campaignId: string;
  sourceId: string; // This is the ID of the CampaignSource document
  createdAt: string | FieldValue;
  timeline: TimelineEvent[];
  category?: string;
  location?: string;
  feedbackRequestSent?: boolean;
  feedbackScore?: number;
  googleReview?: boolean;
};

export type Customer = {
    id: string; // Firestore document ID
    phone: string; // The unique identifier
    pincode?: string;
    firstVisitDate: string | FieldValue;
    lastVisitDate: string | FieldValue;
    totalVisits: number; // a.k.a. total leads
    totalEncashments: number;
    associatedLeadIds: string[];
}

export type Franchise = {
  id: string;
  name:string;
  totalScans: number;
  totalLeads: number;
  successfullyEncashed: number;
};

export type Place = {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  placementType: 'Poster' | 'Standee' | 'Counter' | 'Banner' | 'Custom';
  startDate: string;
  endDate: string;
};

export type CampaignSource = {
    id: string; // Unique ID for this specific campaign-place link, e.g. "cs_1"
    campaignId: string;
    sourceId: string; // This will now be placeId from the master Places list
    scans: number;
    leads: number;
    encashed: number;
}

export type AnalyticsData = {
  totalScans: number;
  totalLeads: number;
  successfullyEncashed: number;
  leadsOverTime: {
    date: string;
    leads: number;
    encashed: number;
  }[];
  customerStats?: {
    totalCustomers: number;
    newCustomers: number;
    repeatCustomers: number;
  };
}

export type Discount = {
    id: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;
    status: 'active' | 'inactive';
};

export type CategoryLead = {
  category: string;
  leads: number;
};

export type LocationLead = {
  location: string;
  category: string;
  leads: number;
};

export type PincodeLead = {
  pincode: string;
  leads: number;
}

export type PlaceWithStats = Place & {
  totalLeads: number;
  totalEncashed: number;
  costPerLead: number;
  costPerEncashment: number;
}

export type Staff = {
  id: string;
  name: string;
  branchId: string;
  role: 'Manager' | 'Staff';
  totalHandled: number;
  totalEncashed: number;
};
