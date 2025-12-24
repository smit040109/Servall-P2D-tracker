
import type { Campaign, Lead, Franchise, AnalyticsData, Discount, Place, CampaignSource, CategoryLead, LocationLead } from './types';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to read data from JSON files
async function readData<T>(filename: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'data', filename);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    // If the file is empty, return the default empty state for that type
    if (fileContent.trim() === '') {
        const defaultDataPath = path.join(process.cwd(), 'src', 'lib', 'data', `default-${filename}`);
        const defaultFileContent = await fs.readFile(defaultDataPath, 'utf-8');
        return JSON.parse(defaultFileContent);
    }
    return JSON.parse(fileContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // If the file doesn't exist, create it with default data
        const defaultDataPath = path.join(process.cwd(), 'src', 'lib', 'data', `default-${filename}`);
        try {
            const defaultFileContent = await fs.readFile(defaultDataPath, 'utf-8');
            await fs.writeFile(filePath, defaultFileContent, 'utf-8');
            return JSON.parse(defaultFileContent);
        } catch (readError) {
            console.error(`Error reading default data for ${filename}:`, readError);
            return [] as T;
        }
    }
    console.error(`Error reading ${filename}:`, error);
    return [] as T;
  }
}

async function writeData(filename: string, data: any): Promise<void> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'data', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


export async function getCampaigns(): Promise<Campaign[]> {
  return await readData<Campaign[]>('campaigns.json');
}

export async function getCampaignById(campaignId: string): Promise<Campaign | undefined> {
    const campaigns = await getCampaigns();
    return campaigns.find(c => c.id === campaignId);
}

export async function getLeadByPhone(phone: string): Promise<Lead | undefined> {
    const leads = await readData<Lead[]>('leads.json');
    return leads.find(lead => lead.phone === phone);
}

export async function getAdminAnalytics(): Promise<AnalyticsData> {
    const campaignSources = await readData<CampaignSource[]>('campaignSources.json');
    const leads = await readData<Lead[]>('leads.json');
    
    const totalScans = campaignSources.reduce((sum, s) => sum + s.scans, 0);
    const totalLeads = leads.length;
    const successfullyEncashed = leads.filter(l => l.status === 'encashed').length;

    const analyticsData: AnalyticsData = {
        totalScans,
        totalLeads,
        successfullyEncashed,
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
    return analyticsData;
}

export async function getCategoryLeads(): Promise<CategoryLead[]> {
    const leads = await readData<Lead[]>('leads.json');
    const categoryCounts: Record<string, number> = {};
    leads.forEach(lead => {
        if (lead.category) {
            categoryCounts[lead.category] = (categoryCounts[lead.category] || 0) + 1;
        }
    });
    return Object.entries(categoryCounts).map(([category, leads]) => ({ category, leads }));
}

export async function getLocationLeads(): Promise<LocationLead[]> {
    const leads = await readData<Lead[]>('leads.json');
    const places = await getPlaces();
    const locationCounts: Record<string, { leads: number, category: string }> = {};

    leads.forEach(lead => {
        if (lead.location && lead.category) {
            const locationKey = lead.location; // Use the stored location name directly
            if (!locationCounts[locationKey]) {
                locationCounts[locationKey] = { leads: 0, category: lead.category };
            }
            locationCounts[locationKey].leads++;
        }
    });
    return Object.entries(locationCounts).map(([location, data]) => ({ location, leads: data.leads, category: data.category }));
}

export async function getBranchAnalytics(branchId: string): Promise<AnalyticsData> {
    const campaigns = (await getCampaigns()).filter(c => c.branchId === branchId);
    const campaignIds = campaigns.map(c => c.id);
    const allCampaignSources = await readData<CampaignSource[]>('campaignSources.json');
    const branchCampaignSources = allCampaignSources.filter(cs => campaignIds.includes(cs.campaignId));
    
    const totalScans = branchCampaignSources.reduce((sum, cs) => sum + cs.scans, 0);
    const totalLeads = branchCampaignSources.reduce((sum, cs) => sum + cs.leads, 0);
    const successfullyEncashed = branchCampaignSources.reduce((sum, cs) => sum + cs.encashed, 0);

    const leadsOverTime = [ // mock data
        { date: 'Oct 1', leads: 50, encashed: 20 },
        { date: 'Oct 2', leads: 75, encashed: 35 },
        { date: 'Oct 3', leads: 60, encashed: 40 },
        { date: 'Oct 4', leads: 90, encashed: 55 },
        { date: 'Oct 5', leads: 110, encashed: 70 },
        { date: 'Oct 6', leads: 85, encashed: 60 },
        { date: 'Oct 7', leads: 120, encashed: 80 },
    ];

    return {
        totalScans,
        totalLeads,
        successfullyEncashed,
        leadsOverTime: leadsOverTime.map(d => ({...d, leads: Math.floor(d.leads/3), encashed: Math.floor(d.encashed/3)})) // mock scaled data
    };
}

export async function getFranchises(): Promise<Franchise[]> {
    return await readData<Franchise[]>('franchises.json');
}

export async function getDiscounts(): Promise<Discount[]> {
    return await readData<Discount[]>('discounts.json');
}

export async function getPlaces(): Promise<Place[]> {
    return await readData<Place[]>('places.json');
}

export async function getCampaignSources(campaignId: string): Promise<CampaignSource[]> {
    const sources = await readData<CampaignSource[]>('campaignSources.json');
    return sources.filter(cs => cs.campaignId === campaignId);
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
