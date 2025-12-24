import type { Campaign, Lead, Franchise, AnalyticsData, Discount, Place, CampaignSource, CategoryLead, LocationLead, PlaceWithStats, TimelineEvent, Customer, PincodeLead } from './types';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from '@/firebase/firebase';
import { collection, query, where, getDocs, Timestamp, DocumentData } from 'firebase/firestore';


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

// Helper to convert Firestore document to a Lead object, handling Timestamps.
function convertFirestoreDocToLead(doc: DocumentData): Lead {
    const data = doc.data();
    
    // Convert timeline event timestamps
    const timeline = (data.timeline || []).map((event: any) => ({
      ...event,
      timestamp: (event.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString()
    }));


    return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        vehicle: data.vehicle,
        pincode: data.pincode,
        status: data.status,
        campaignId: data.campaignId,
        sourceId: data.sourceId,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        timeline: timeline,
        category: data.category,
        location: data.placeName,
        feedbackRequestSent: data.feedbackRequestSent,
        feedbackScore: data.feedbackScore,
        googleReview: data.googleReview,
    };
}


export async function getLeadByPhone(phone: string): Promise<Lead | undefined> {
    if (!db) {
        console.warn("Firestore is not initialized. Cannot fetch lead by phone.");
        return undefined;
    }
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return undefined;
    }

    // Assuming phone number is unique, return the first found lead
    return convertFirestoreDocToLead(querySnapshot.docs[0]);
}

// Central function to fetch all leads from the global "leads" collection.
async function getAllLeads(): Promise<Lead[]> {
    if (!db) {
        console.warn("Firestore is not initialized. Cannot fetch all leads.");
        return [];
    }
    const leadsRef = collection(db, 'leads');
    const querySnapshot = await getDocs(leadsRef);
    return querySnapshot.docs.map(convertFirestoreDocToLead);
}

async function getAllCustomers(): Promise<Customer[]> {
    if (!db) {
        console.warn("Firestore is not initialized. Cannot fetch customers.");
        return [];
    }
    const customersRef = collection(db, 'customers');
    const querySnapshot = await getDocs(customersRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
}


export async function getAdminAnalytics(): Promise<AnalyticsData> {
    const [campaignSources, leads, customers] = await Promise.all([
        readData<CampaignSource[]>('campaignSources.json'),
        getAllLeads(),
        getAllCustomers(),
    ]);
    
    const totalScans = campaignSources.reduce((sum, s) => sum + s.scans, 0);
    const totalLeads = leads.length;
    const successfullyEncashed = leads.filter(l => l.status === 'encashed').length;

    // Customer stats
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.totalVisits > 1).length;
    const newCustomers = totalCustomers - repeatCustomers;

    const analyticsData: AnalyticsData = {
        totalScans,
        totalLeads,
        successfullyEncashed,
        customerStats: {
            totalCustomers,
            newCustomers,
            repeatCustomers,
        },
        leadsOverTime: [ // This is mock data, but in a real scenario, it would be aggregated from the `leads` collection.
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
    const leads = await getAllLeads(); // Reading from Firestore
    const categoryCounts: Record<string, number> = {};
    leads.forEach(lead => {
        if (lead.category) {
            categoryCounts[lead.category] = (categoryCounts[lead.category] || 0) + 1;
        }
    });
    return Object.entries(categoryCounts).map(([category, leads]) => ({ category, leads }));
}

export async function getLocationLeads(): Promise<LocationLead[]> {
    const leads = await getAllLeads(); // Reading from Firestore
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

export async function getPincodeLeads(): Promise<PincodeLead[]> {
    const leads = await getAllLeads(); // Reading from Firestore
    const pincodeCounts: Record<string, number> = {};
    leads.forEach(lead => {
        if (lead.pincode) {
            pincodeCounts[lead.pincode] = (pincodeCounts[lead.pincode] || 0) + 1;
        }
    });
    return Object.entries(pincodeCounts).map(([pincode, leads]) => ({ pincode, leads }));
}

export async function getBranchAnalytics(branchId: string): Promise<AnalyticsData> {
    const campaigns = (await getCampaigns()).filter(c => c.branchId === branchId);
    const campaignIds = campaigns.map(c => c.id);
    const allCampaignSources = await readData<CampaignSource[]>('campaignSources.json');
    const branchCampaignSources = allCampaignSources.filter(cs => campaignIds.includes(cs.campaignId));
    
    const totalScans = branchCampaignSources.reduce((sum, cs) => sum + cs.scans, 0);
    const allLeads = await getAllLeads();

    // The CRM correctly filters all leads to include only those associated with the branch's campaigns.
    const branchLeads = allLeads.filter(l => campaignIds.includes(l.campaignId));

    const totalLeads = branchLeads.length;
    const successfullyEncashed = branchLeads.filter(l => l.status === 'encashed').length;


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

export async function getPlacesWithStats(): Promise<PlaceWithStats[]> {
    const [places, campaignSources, leads] = await Promise.all([
        getPlaces(),
        readData<CampaignSource[]>('campaignSources.json'),
        getAllLeads()
    ]);

    const placeStats = new Map<string, { totalLeads: number; totalEncashed: number }>();

    // Initialize stats for each place
    for (const place of places) {
        placeStats.set(place.id, { totalLeads: 0, totalEncashed: 0 });
    }

    // Map sourceId (from CampaignSource) to placeId
    const sourceIdToPlaceId = new Map<string, string>();
    for (const cs of campaignSources) {
        sourceIdToPlaceId.set(cs.id, cs.sourceId);
    }
    
    // Aggregate leads and encashed counts
    for (const lead of leads) {
        const placeId = sourceIdToPlaceId.get(lead.sourceId);
        if (placeId && placeStats.has(placeId)) {
            const stats = placeStats.get(placeId)!;
            stats.totalLeads++;
            if (lead.status === 'encashed') {
                stats.totalEncashed++;
            }
        }
    }
    
    // Combine places with their stats and calculate ROI metrics
    return places.map(place => {
        const stats = placeStats.get(place.id) || { totalLeads: 0, totalEncashed: 0 };
        const costPerLead = stats.totalLeads > 0 ? place.monthlyCost / stats.totalLeads : 0;
        const costPerEncashment = stats.totalEncashed > 0 ? place.monthlyCost / stats.totalEncashed : 0;
        
        return {
            ...place,
            ...stats,
            costPerLead,
            costPerEncashment,
        };
    });
}

export async function getCampaignSources(campaignId: string): Promise<CampaignSource[]> {
    const sources = await readData<CampaignSource[]>('campaignSources.json');
    return sources.filter(cs => cs.campaignId === campaignId);
}

export async function getCampaignSourceStats(campaignId: string) {
    const sources = await getCampaignSources(campaignId);
    const allLeads = await getAllLeads(); // Fetch all leads from Firestore
    
    // Filter all leads to get only those for the specified campaignId.
    const campaignLeads = allLeads.filter(l => l.campaignId === campaignId);

    const campaignSourceIds = sources.map(s => s.id);
    
    // Further filter campaign leads to those from the campaign's sources.
    const relevantLeads = campaignLeads.filter(l => l.sourceId && campaignSourceIds.includes(l.sourceId));


    const scans = sources.reduce((acc, source) => acc + source.scans, 0);
    const leads = relevantLeads.length;
    const encashed = relevantLeads.filter(l => l.status === 'encashed').length;

    return { scans, leads, encashed };
}
