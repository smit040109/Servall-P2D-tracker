import type { Campaign, Lead, Franchise, AnalyticsData, Discount } from './types';

const discounts: Discount[] = [
  { id: 'disc_1', code: 'DIWALI20', description: '20% off on all services', type: 'percentage', value: 20, status: 'active' },
  { id: 'disc_2', code: 'MONSOON500', description: '₹500 flat off on bills above ₹2000', type: 'fixed', value: 500, status: 'active' },
  { id: 'disc_3', code: 'NEWYEAR15', description: '15% off on ceramic coating', type: 'percentage', value: 15, status: 'inactive' },
];

const campaigns: Campaign[] = [
  { id: 'cam_1', name: 'Diwali Dhamaka', branch: 'Koramangala', qrCodeUrl: '/campaign/cam_1', scans: 1250, leads: 800, encashed: 450, discountId: 'disc_1' },
  { id: 'cam_2', name: 'Monsoon Offer', branch: 'Indiranagar', qrCodeUrl: '/campaign/cam_2', scans: 980, leads: 620, encashed: 310, discountId: 'disc_2' },
  { id: 'cam_3', name: 'New Year Special', branch: 'HSR Layout', qrCodeUrl: '/campaign/cam_3', scans: 1500, leads: 1100, encashed: 700, discountId: 'disc_3' },
];

const leads: Lead[] = [
  { id: 'lead_1', name: 'Ravi Kumar', phone: '9876543210', vehicle: 'Maruti Swift', status: 'pending', campaignId: 'cam_1', createdAt: '2023-10-15T10:00:00Z' },
  { id: 'lead_2', name: 'Sunita Sharma', phone: '9876543211', vehicle: 'Hyundai i20', status: 'encashed', campaignId: 'cam_2', createdAt: '2023-10-16T11:30:00Z' },
  { id: 'lead_3', name: 'Amit Patel', phone: '9876543212', vehicle: 'Honda City', status: 'pending', campaignId: 'cam_1', createdAt: '2023-10-17T14:00:00Z' },
  { id: 'lead_4', name: 'Priya Singh', phone: '9876543213', vehicle: 'Tata Nexon', status: 'rejected', campaignId: 'cam_3', createdAt: '2023-10-18T16:45:00Z' },
];

const franchises: Franchise[] = [
    { id: 'fran_1', name: 'Koramangala', totalScans: 1250, totalLeads: 800, successfullyEncashed: 450 },
    { id: 'fran_2', name: 'Indiranagar', totalScans: 980, totalLeads: 620, successfullyEncashed: 310 },
    { id: 'fran_3', name: 'HSR Layout', totalScans: 1500, totalLeads: 1100, successfullyEncashed: 700 },
];

const analyticsData: AnalyticsData = {
    totalScans: franchises.reduce((sum, f) => sum + f.totalScans, 0),
    totalLeads: franchises.reduce((sum, f) => sum + f.totalLeads, 0),
    successfullyEncashed: franchises.reduce((sum, f) => sum + f.successfullyEncashed, 0),
    leadsOverTime: [
        { date: 'Oct 1', leads: 50, encashed: 20 },
        { date: 'Oct 2', leads: 75, encashed: 35 },
        { date: 'Oct 3', leads: 60, encashed: 40 },
        { date: 'Oct 4', leads: 90, encashed: 55 },
        { date: 'Oct 5', leads: 110, encashed: 70 },
        { date: 'Oct 6', leads: 85, encashed: 60 },
        { date: 'Oct 7', leads: 120, encashed: 80 },
    ]
}

export async function getCampaigns(): Promise<Campaign[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return campaigns;
}

export async function getLeadByPhone(phone: string): Promise<Lead | undefined> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return leads.find(lead => lead.phone === phone);
}

export async function getAdminAnalytics(): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return analyticsData;
}

export async function getBranchAnalytics(branchId: string): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const franchise = franchises.find(f => f.id === branchId);
    if (!franchise) {
        return { totalScans: 0, totalLeads: 0, successfullyEncashed: 0, leadsOverTime: [] };
    }

    return {
        ...franchise,
        totalScans: franchise.totalScans,
        totalLeads: franchise.totalLeads,
        successfullyEncashed: franchise.successfullyEncashed,
        leadsOverTime: analyticsData.leadsOverTime.map(d => ({...d, leads: Math.floor(d.leads/3), encashed: Math.floor(d.encashed/3)})) // mock scaled data
    };
}

export async function getFranchises(): Promise<Franchise[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return franchises;
}

export async function getDiscounts(): Promise<Discount[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return discounts;
}
