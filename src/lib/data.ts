
import type { Campaign, Lead, Franchise, AnalyticsData, Discount, Place, CampaignSource, CategoryLead, LocationLead } from './types';
import { promises as fs } from 'fs';
import path from 'path';

// Helper function to read data from JSON files
async function readData<T>(filename: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'data', filename);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
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
    const franchises = await getFranchises();
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
        if (lead.location) {
            const place = places.find(p => p.name.toLowerCase().replace(/\s+/g, '_') === lead.location);
            if (place) {
                if (!locationCounts[place.name]) {
                    locationCounts[place.name] = { leads: 0, category: place.category };
                }
                locationCounts[place.name].leads++;
            }
        }
    });
    return Object.entries(locationCounts).map(([location, data]) => ({ location, leads: data.leads, category: data.category }));
}

export async function getBranchAnalytics(branchId: string): Promise<AnalyticsData> {
    const franchise = (await getFranchises()).find(f => f.id === branchId);
    if (!franchise) {
        return { totalScans: 0, totalLeads: 0, successfullyEncashed: 0, leadsOverTime: [] };
    }

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
        ...franchise,
        totalScans: franchise.totalScans,
        totalLeads: franchise.totalLeads,
        successfullyEncashed: franchise.successfullyEncashed,
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

export async function createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) {
    try {
        const leads = await readData<Lead[]>('leads.json');
        const newLead: Lead = {
            id: `lead_${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'pending',
            ...leadData
        };
        leads.push(newLead);
        await writeData('leads.json', leads);

        // Also increment scan count (for simplicity, we increment scan on lead creation)
        if(newLead.campaignId) {
             const campaignSources = await readData<CampaignSource[]>('campaignSources.json');
             const source = campaignSources.find(cs => cs.campaignId === newLead.campaignId && cs.sourceId === newLead.sourceId);
             if (source) {
                 source.scans++;
                 source.leads++;
                 await writeData('campaignSources.json', campaignSources);
             }
        }
        return { success: true, message: 'Lead created successfully' };
    } catch(e) {
        return { success: false, message: 'Failed to create lead' };
    }
}
