
export type Campaign = {
  id: string;
  name: string;
  city: string;
  branchId: string;
  discountId: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: 'pending' | 'encashed' | 'rejected';
  campaignId: string;
  sourceId: string; // This is the ID of the CampaignSource document
  createdAt: string;
  category?: string;
  location?: string;
};

export type Franchise = {
  id: string;
  name: string;
  totalScans: number;
  totalLeads: number;
  successfullyEncashed: number;
};

export type Place = {
  id: string;
  name: string;
  category: string;
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
