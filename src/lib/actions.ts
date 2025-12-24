'use server';

import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';
import type { Campaign, Place, CampaignSource, Discount, Franchise, Lead, TimelineEvent, Customer } from './types';
import { db } from '@/firebase/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc, arrayUnion, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { format } from 'date-fns';
import { z } from 'zod';

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
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    campaigns.push(newCampaign);
    await writeData('campaigns.json', campaigns);
    revalidatePath('/admin/campaigns');
    return { success: true, message: 'Campaign created successfully.' };
  } catch (error) {
    console.error(error);
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
      monthlyCost: Number(formData.get('monthlyCost')),
      placementType: formData.get('placementType') as Place['placementType'],
      startDate: format(new Date(formData.get('startDate') as string), 'yyyy-MM-dd'),
      endDate: format(new Date(formData.get('endDate') as string), 'yyyy-MM-dd'),
    };
    places.push(newPlace);
    await writeData('places.json', places);
    revalidatePath('/admin/places');
    return { success: true, message: 'Place created successfully.' };
  } catch (error) {
    console.error(error);
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

// This is kept for other potential server-side logic, but lead creation is now on the client.
export async function createLeadAction(prevState: any, formData: FormData) {
    revalidatePath('/admin/leads');
    // The main logic is now client-side, but we can still perform
    // server-side revalidation or other tasks here if needed.
    return { success: true, message: 'Revalidation triggered.' };
}


export async function updateLeadStatus(
    leadId: string, 
    leadPhone: string, 
    staffName: string,
    updates: Partial<Lead>
) {
  if (!db) {
    console.error("Firestore is not initialized. Cannot update lead status.");
    return { success: false, message: 'Database connection is not available.' };
  }
  
  const batch = writeBatch(db);
  const leadRef = doc(db, 'leads', leadId);

  try {
    const updatePayload: any = { ...updates };
    let timelineEvents: TimelineEvent[] = [];

    // If status is changing to 'encashed', add a timeline event for it.
    if (updates.status && updates.status === 'encashed') {
        timelineEvents.push({
            event: 'Offer Encashed',
            timestamp: serverTimestamp(),
            source: staffName,
            notes: `Status changed to ${updates.status}`
        });
    }
    
    // If feedback request is being sent, add a timeline event for it.
    if(updates.feedbackRequestSent) {
        timelineEvents.push({
            event: 'Feedback Request Sent',
            timestamp: serverTimestamp(),
            source: staffName,
            notes: 'Feedback request sent to customer'
        });
    }

    if(timelineEvents.length > 0) {
      updatePayload.timeline = arrayUnion(...timelineEvents);
    }
    
    batch.update(leadRef, updatePayload);

    // If status is 'encashed', also update the associated customer record.
    if (updates.status === 'encashed') {
        const customersRef = collection(db, "customers");
        const q = query(customersRef, where("phone", "==", leadPhone));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const customerDoc = querySnapshot.docs[0];
            const customerRef = doc(db, "customers", customerDoc.id);
            const customerData = customerDoc.data() as Customer;
            batch.update(customerRef, {
                totalEncashments: (customerData.totalEncashments || 0) + 1,
                lastVisitDate: serverTimestamp(), // Also update last visit on encashment
            });
        }
    }

    await batch.commit();

    revalidatePath('/branch');
    return { success: true, message: 'Lead updated successfully.' };

  } catch (error) {
    console.error('Failed to update lead:', error);
    return { success: false, message: 'Failed to update lead.' };
  }
}



    