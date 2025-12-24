'use server';

import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';
import type { Campaign, Place, CampaignSource, Discount, Franchise, Lead } from './types';
import { getDb } from '@/firebase/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

// Helper function to read data from JSON files
async function readData<T>(filename: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'data', filename);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
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
    // Return empty array or object if file doesn't exist or is empty
    return [] as T;
  }
}

// Helper function to write data to JSON files
async function writeData(filename: string, data: any): Promise<void> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'data', filename);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
  }
}

// --- Campaign Actions ---

export async function createCampaign(formData: FormData) {
  try {
    const campaigns = await readData<Campaign[]>('campaigns.json');
    const newCampaign: Campaign = {
      id: `cam_${Date.now()}`,
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      branchId: formData.get('branchId') as string,
      discountId: formData.get('discountId') as string,
    };
    campaigns.push(newCampaign);
    await writeData('campaigns.json', campaigns);
    revalidatePath('/admin/campaigns');
    return { success: true, message: 'Campaign created successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to create campaign.' };
  }
}

export async function deleteCampaign(campaignId: string) {
  try {
    let campaigns = await readData<Campaign[]>('campaigns.json');
    campaigns = campaigns.filter((c) => c.id !== campaignId);
    await writeData('campaigns.json', campaigns);
    
    // Also delete associated campaign sources
    let campaignSources = await readData<CampaignSource[]>('campaignSources.json');
    campaignSources = campaignSources.filter(cs => cs.campaignId !== campaignId);
    await writeData('campaignSources.json', campaignSources);

    revalidatePath('/admin/campaigns');
    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true, message: 'Campaign deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete campaign.' };
  }
}


// --- Place Actions ---

export async function createPlace(formData: FormData) {
  try {
    const places = await readData<Place[]>('places.json');
    const newPlace: Place = {
      id: `place_${Date.now()}`,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
    };
    places.push(newPlace);
    await writeData('places.json', places);
    revalidatePath('/admin/places');
    return { success: true, message: 'Place created successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to create place.' };
  }
}

export async function deletePlace(placeId: string) {
    try {
        let places = await readData<Place[]>('places.json');
        places = places.filter((p) => p.id !== placeId);
        await writeData('places.json', places);
        revalidatePath('/admin/places');
        return { success: true, message: 'Place deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Failed to delete place.' };
    }
}


// --- Campaign Source Actions ---

export async function addSourceToCampaign(formData: FormData) {
    try {
        const campaignSources = await readData<CampaignSource[]>('campaignSources.json');
        const campaignId = formData.get('campaignId') as string;
        const sourceId = formData.get('sourceId') as string;

        // Create a new campaign source document. This ensures it's always an "add" operation.
        const newSource: CampaignSource = {
            id: `cs_${Date.now()}`, // Unique ID for this specific campaign-place instance
            campaignId: campaignId,
            sourceId: sourceId, // The ID of the master "Place"
            scans: 0,
            leads: 0,
            encashed: 0,
        };

        campaignSources.push(newSource);
        await writeData('campaignSources.json', campaignSources);
        revalidatePath(`/admin/campaigns/${campaignId}`);
        return { success: true, message: 'Source added to campaign successfully.' };

    } catch (error) {
        console.error("Error adding source to campaign:", error);
        return { success: false, message: 'Failed to add source to campaign.' };
    }
}


export async function deleteCampaignSource(campaignSourceId: string, campaignId: string) {
    try {
        let campaignSources = await readData<CampaignSource[]>('campaignSources.json');
        campaignSources = campaignSources.filter((cs) => cs.id !== campaignSourceId);
        await writeData('campaignSources.json', campaignSources);
        revalidatePath(`/admin/campaigns/${campaignId}`);
        return { success: true, message: 'Campaign source deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Failed to delete campaign source.' };
    }
}

// --- Discount Actions ---
export async function createDiscount(formData: FormData) {
  try {
    const discounts = await readData<Discount[]>('discounts.json');
    const newDiscount: Discount = {
      id: `disc_${Date.now()}`,
      code: formData.get('code') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as 'percentage' | 'fixed',
      value: Number(formData.get('value')),
      status: 'active' // Default status
    };
    discounts.push(newDiscount);
    await writeData('discounts.json', discounts);
    revalidatePath('/admin/discounts');
    return { success: true, message: 'Discount created successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to create discount.' };
  }
}

// --- Branch Actions ---
export async function createBranch(formData: FormData) {
  try {
    const branches = await readData<Franchise[]>('franchises.json');
    const newBranch: Franchise = {
      id: `fran_${Date.now()}`,
      name: formData.get('name') as string,
      totalScans: 0,
      totalLeads: 0,
      successfullyEncashed: 0
    };
    branches.push(newBranch);
    await writeData('franchises.json', branches);
    revalidatePath('/admin/branches');
    return { success: true, message: 'Branch created successfully.' };
  } catch (error)
 {
    return { success: false, message: 'Failed to create branch.' };
  }
}

export async function deleteBranch(branchId: string) {
    try {
        let branches = await readData<Franchise[]>('franchises.json');
        branches = branches.filter((b) => b.id !== branchId);
        await writeData('franchises.json', branches);
        revalidatePath('/admin/branches');
        return { success: true, message: 'Branch deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Failed to delete branch.' };
    }
}


// --- Lead Actions ---
export async function updateLeadStatus(leadId: string, status: Lead['status']) {
  const db = getDb();
  if (!db) {
    console.error("Firestore is not initialized. Cannot update lead status.");
    return { success: false, message: 'Database connection is not available.' };
  }
  
  try {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, { status });

    if (status === 'encashed') {
      // This part still uses file system, will need to be migrated if full migration is needed.
      // For now, we focus on leads.
      // const lead = leads[leadIndex];
      // const campaignSources = await readData<CampaignSource[]>('campaignSources.json');
      // const sourceIndex = campaignSources.findIndex(cs => cs.id === lead.sourceId);

      // if (sourceIndex > -1) {
      //     campaignSources[sourceIndex].encashed++;
      // }
      // await writeData('campaignSources.json', campaignSources);
    }
    
    revalidatePath('/branch');
    return { success: true, message: `Lead status updated to ${status}.` };

  } catch (error) {
    console.error('Failed to update lead status:', error);
    return { success: false, message: 'Failed to update lead status.' };
  }
}

export async function createLead(leadData: { name: string, phone: string, vehicle: string, campaignId: string, sourceId: string }) {
    const db = getDb();
    if (!db) {
        console.error("Firestore is not initialized. Cannot create lead.");
        return { success: false, message: 'Database connection is not available.' };
    }
    
    try {
        const [campaignSources, places] = await Promise.all([
            readData<CampaignSource[]>('campaignSources.json'),
            readData<Place[]>('places.json')
        ]);
        
        const campaignSource = campaignSources.find(cs => cs.id === leadData.sourceId);
        if (!campaignSource) {
            return { success: false, message: 'Invalid QR code. Source not found.' };
        }
        
        const place = places.find(p => p.id === campaignSource.sourceId);
        if (!place) {
            return { success: false, message: 'Invalid place data associated with QR code.' };
        }

        const newLeadPayload = {
            name: leadData.name,
            phone: leadData.phone,
            vehicle: leadData.vehicle,
            campaignId: leadData.campaignId,
            sourceId: leadData.sourceId,
            category: place.category,
            placeName: place.name,
            status: 'pending' as const,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "leads"), newLeadPayload);
        
        // Increment scan and lead count for the specific campaign source
        const sourceIndex = campaignSources.findIndex(cs => cs.id === leadData.sourceId);
        if (sourceIndex > -1) {
            campaignSources[sourceIndex].scans++;
            campaignSources[sourceIndex].leads++;
            await writeData('campaignSources.json', campaignSources);
        }

        revalidatePath(`/admin/campaigns/${leadData.campaignId}`);
        revalidatePath('/admin');
        return { success: true, message: 'Lead created successfully' };
    } catch(e) {
        console.error("Lead save failed:", e);
        return { success: false, message: 'Failed to save your details. Please try again.' };
    }
}
