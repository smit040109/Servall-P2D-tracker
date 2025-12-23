export type Campaign = {
  id: string;
  name: string;
  branch: string;
  qrCodeUrl: string;
  scans: number;
  leads: number;
  encashed: number;
  discountId: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: 'pending' | 'encashed' | 'rejected';
  campaignId: string;
  createdAt: string;
};

export type Franchise = {
  id: string;
  name: string;
  totalScans: number;
  totalLeads: number;
  successfullyEncashed: number;
};

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
