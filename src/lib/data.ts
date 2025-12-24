
import type { Campaign, Lead, Franchise, AnalyticsData, Discount, Place, CampaignSource } from './types';

const discounts: Discount[] = [
  { id: 'disc_1', code: 'DIWALI20', description: '20% off on all services', type: 'percentage', value: 20, status: 'active' },
  { id: 'disc_2', code: 'MONSOON500', description: '₹500 flat off on bills above ₹2000', type: 'fixed', value: 500, status: 'active' },
  { id: 'disc_3', code: 'NEWYEAR15', description: '15% off on ceramic coating', type: 'percentage', value: 15, status: 'inactive' },
];

const places: Place[] = [
    { id: 'place_1', name: 'ABC Salon', category: 'Salon' },
    { id: 'place_2', name: 'XYZ Salon', category: 'Salon' },
    { id: 'place_3', name: 'Gold\'s Gym', category: 'Gym' },
    { id: 'place_4', name: 'Local Kirana Store', category: 'Local Shop' },
    { id: 'place_5', name: 'Sangeet Dance Academy', category: 'Dance Class' },
    { id: 'place_6', name: 'PVR Cinemas', category: 'Theatre' },
    { id: 'place_7', name: 'Prestige Apartments', category: 'Apartment' },
    { id: 'place_8', name: 'Phoenix Mall', category: 'Mall' },
];


const campaigns: Campaign[] = [
  { id: 'cam_1', name: 'Diwali Dhamaka Bangalore', city: 'Bangalore', branchId: 'fran_1', discountId: 'disc_1' },
  { id: 'cam_2', name: 'Monsoon Offer Bangalore', city: 'Bangalore', branchId: 'fran_2', discountId: 'disc_2' },
  { id: 'cam_3', name: 'New Year Special Mumbai', city: 'Mumbai', branchId: 'fran_3', discountId: 'disc_3' },
];

const campaignSources: CampaignSource[] = [
    {id: 'cs_1', campaignId: 'cam_1', sourceId: 'place_1', scans: 150, leads: 100, encashed: 50},
    {id: 'cs_2', campaignId: 'cam_1', sourceId: 'place_3', scans: 200, leads: 150, encashed: 80},
    {id: 'cs_3', campaignId: 'cam_2', sourceId: 'place_8', scans: 500, leads: 300, encashed: 150},
]

const leads: Lead[] = [
  { id: 'lead_1', name: 'Ravi Kumar', phone: '9876543210', vehicle: 'Maruti Swift', status: 'pending', campaignId: 'cam_1', sourceId: 'place_1', createdAt: '2023-10-15T10:00:00Z' },
  { id: 'lead_2', name: 'Sunita Sharma', phone: '9876543211', vehicle: 'Hyundai i20', status: 'encashed', campaignId: 'cam_2', sourceId: 'place_8', createdAt: '2023-10-16T11:30:00Z' },
  { id: 'lead_3', name: 'Amit Patel', phone: '9876543212', vehicle: 'Honda City', status: 'pending', campaignId: 'cam_1', sourceId: 'place_3', createdAt: '2023-10-17T14:00:00Z' },
  { id: 'lead_4', name: 'Priya Singh', phone: '9876543213', vehicle: 'Tata Nexon', status: 'rejected', campaignId: 'cam_3', sourceId: 'place_1', createdAt: '2023-10-18T16:45:00Z' },
];

const franchises: Franchise[] = [
    { id: 'fran_1', name: 'Koramangala', totalScans: campaignSources.filter(cs => campaigns.find(c => c.id === cs.campaignId)?.branchId === 'fran_1').reduce((sum, cs) => sum + cs.scans, 0), totalLeads: 800, successfullyEncashed: 450 },
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
  await new Promise(resolve => setTimeout(resolve, 500));
  return campaigns;
}

export async function getCampaignById(campaignId: string): Promise<Campaign | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return campaigns.find(c => c.id === campaignId);
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

export async function getPlaces(): Promise<Place[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return places;
}

export async function getCampaignSources(campaignId: string): Promise<CampaignSource[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return campaignSources.filter(cs => cs.campaignId === campaignId);
}

export async function getCampaignSourceStats(campaignId: string) {
    const sources = await getCampaignSources(campaignId);
    return sources.reduce((acc, source) => {
        acc.scans += source.scans;
        acc.leads += source.leads;
        acc.encashed += source.encashed;
        return acc;
    }, { scans: 0, leads: 0, encashed: 0 });
}
