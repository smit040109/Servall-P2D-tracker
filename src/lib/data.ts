
import type { Campaign, Lead, Franchise, AnalyticsData, Discount, Place, CampaignSource, CategoryLead, LocationLead, PlaceWithStats, TimelineEvent, Customer, PincodeLead } from './types';
import { db } from '@/firebase/firebase';
import { collection, query, where, getDocs, Timestamp, DocumentData, orderBy } from 'firebase/firestore';

// In-memory data stores, initialized from default JSON files
import campaignsData from './data/default-campaigns.json';
import campaignSourcesData from './data/default-campaignSources.json';
import discountsData from './data/default-discounts.json';
import franchisesData from './data/default-franchises.json';
import placesData from './data/default-places.json';

// In a real application, you would manage state changes, but for this mock implementation,
// we will just serve the default data.
let campaigns: Campaign[] = campaignsData;
let campaignSources: CampaignSource[] = campaignSourcesData;
let discounts: Discount[] = discountsData;
let franchises: Franchise[] = franchisesData;
let places: Place[] = placesData;


export async function getCampaigns(): Promise<Campaign[]> {
  return campaigns;
}

export async function getCampaignById(campaignId: string): Promise<Campaign | undefined> {
    const allCampaigns = await getCampaigns();
    return allCampaigns.find(c => c.id === campaignId);
}

// Helper to convert Firestore document to a Lead object, handling Timestamps.
function convertFirestoreDocToLead(doc: DocumentData, campaignName?: string, placeName?: string): Lead {
    const data = doc.data();
    
    // Convert timeline event timestamps
    const timeline = (data.timeline || []).map((event: any) => {
      let timestampStr: string;
      if (typeof event.timestamp === 'string') {
        timestampStr = event.timestamp;
      } else if (event.timestamp && typeof event.timestamp.toDate === 'function') {
        timestampStr = (event.timestamp as Timestamp).toDate().toISOString();
      } else {
        timestampStr = new Date().toISOString();
      }
      return {
        ...event,
        timestamp: timestampStr
      };
    });

    return {
        id: doc.id,
        name: data.name,
        phone: data.phone,
        vehicle: data.vehicle,
        pincode: data.pincode,
        status: data.status,
        campaignId: data.campaignId,
        sourceId: data.sourceId,
        placeId: data.placeId,
        branchId: data.branchId,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        timeline: timeline,
        category: data.category,
        feedbackRequestSent: data.feedbackRequestSent,
        feedbackScore: data.feedbackScore,
        googleReview: data.googleReview,
        campaignName,
        placeName,
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
    const leadDoc = querySnapshot.docs[0];
    const leadData = leadDoc.data();

    // Fetch campaign and place names
    const campaign = await getCampaignById(leadData.campaignId);
    
    const allPlaces = await getPlaces();

    const place = allPlaces.find(p => p.id === leadData.placeId);
    
    return convertFirestoreDocToLead(leadDoc, campaign?.name, place?.name);
}

// Central function to fetch all leads from the global "leads" collection.
export async function getAllLeads(): Promise<Lead[]> {
    if (!db) {
        console.warn("Firestore is not initialized. Cannot fetch all leads.");
        return [];
    }
    const allCampaigns = await getCampaigns();
    const allPlaces = await getPlaces();
    
    const campaignMap = new Map(allCampaigns.map(c => [c.id, c.name]));
    const placeMap = new Map(allPlaces.map(p => [p.id, p.name]));

    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const campaignName = campaignMap.get(data.campaignId);
      const placeName = placeMap.get(data.placeId);
      return convertFirestoreDocToLead(doc, campaignName, placeName)
    });
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
    const [allCampaignSources, leads, customers] = await Promise.all([
        getCampaignSources(''), // Pass empty string to get all sources
        getAllLeads(),
        getAllCustomers(),
    ]);
    
    const totalScans = allCampaignSources.reduce((sum, s) => sum + s.scans, 0);
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
    const allPlaces = await getPlaces();
    const locationCounts: Record<string, { leads: number, category: string, name: string }> = {};

    leads.forEach(lead => {
        const place = allPlaces.find(p => p.id === lead.placeId);
        if (place) {
            const locationKey = place.id;
            if (!locationCounts[locationKey]) {
                locationCounts[locationKey] = { leads: 0, category: place.category, name: place.name };
            }
            locationCounts[locationKey].leads++;
        }
    });
    return Object.values(locationCounts).map(data => ({ location: data.name, leads: data.leads, category: data.category }));
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
    const allCampaigns = await getCampaigns();
    const campaigns = allCampaigns.filter(c => c.branchId === branchId);
    const campaignIds = campaigns.map(c => c.id);
    const allCampaignSources = await getCampaignSources(''); // Get all
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
    return franchises;
}

export async function getDiscounts(): Promise<Discount[]> {
    return discounts;
}

export async function getPlaces(): Promise<Place[]> {
    return places;
}

export async function getPlacesWithStats(): Promise<PlaceWithStats[]> {
    const [allPlaces, leads] = await Promise.all([
        getPlaces(),
        getAllLeads()
    ]);
    
    // This can be a config value in a real app
    const AVG_TICKET_VALUE = 2500; 

    const placeStats = new Map<string, { totalLeads: number; totalEncashed: number }>();

    // Initialize stats for each place
    for (const place of allPlaces) {
        placeStats.set(place.id, { totalLeads: 0, totalEncashed: 0 });
    }
    
    // Aggregate leads and encashed counts from Firestore leads
    for (const lead of leads) {
        const placeId = lead.placeId;
        if (placeId && placeStats.has(placeId)) {
            const stats = placeStats.get(placeId)!;
            stats.totalLeads++;
            if (lead.status === 'encashed') {
                stats.totalEncashed++;
            }
        }
    }
    
    // Combine places with their stats and calculate ROI metrics
    const placesWithStats = allPlaces.map(place => {
        const stats = placeStats.get(place.id) || { totalLeads: 0, totalEncashed: 0 };
        const costPerLead = stats.totalLeads > 0 ? place.monthlyCost / stats.totalLeads : 0;
        const costPerEncashment = stats.totalEncashed > 0 ? place.monthlyCost / stats.totalEncashed : 0;
        const roiScore = (stats.totalEncashed * AVG_TICKET_VALUE) - place.monthlyCost;
        
        return {
            ...place,
            ...stats,
            costPerLead,
            costPerEncashment,
            roiScore,
        };
    });

    // Sort by the highest ROI score
    return placesWithStats.sort((a, b) => b.roiScore - a.roiScore);
}

export async function getCampaignSources(campaignId: string): Promise<CampaignSource[]> {
    const sources = campaignSources;
    if (!campaignId) return sources;
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
