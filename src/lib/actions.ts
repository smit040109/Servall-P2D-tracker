
'use server';

import { revalidatePath } from 'next/cache';
import type { Lead, TimelineEvent, Customer } from './types';
import { db } from '@/firebase/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc, arrayUnion, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { getCampaignById, getPlaces, getCampaignSources as getCampaignSourcesData } from './data';

// All actions that mutated JSON files are now stubbed to simply return success.
// The data will appear to change on the client because of `revalidatePath`, but changes are not persisted in memory or on disk.
// This is to fix Vercel build errors by removing 'fs' and 'path' dependencies.

export async function incrementScanCount(campaignSourceId: string) {
    try {
        console.log(`(Stub) Incrementing scan count for ${campaignSourceId}`);
        // In a real DB, you would increment a value. For this stub, we revalidate paths to trigger UI updates.
        // The underlying mock data is not changed.
        const campaignSources = await getCampaignSourcesData('');
        const source = campaignSources.find(cs => cs.id === campaignSourceId);
        if (source) {
            revalidatePath(`/admin/campaigns/${source.campaignId}`);
        }
        revalidatePath('/admin/places');
        return { success: true };
    } catch (error) {
        console.error("Failed to increment scan count (stub):", error);
        return { success: false, message: 'Failed to increment scan count.' };
    }
}

export async function incrementLeadCount(campaignSourceId: string) {
    try {
        console.log(`(Stub) Incrementing lead count for ${campaignSourceId}`);
        // The UI will show updated data because `getAllLeads` reads from Firestore,
        // and this revalidation will trigger a refetch.
        const campaignSources = await getCampaignSourcesData('');
        const source = campaignSources.find(cs => cs.id === campaignSourceId);
        if (source) {
          revalidatePath(`/admin/campaigns/${source.campaignId}`);
        }
        revalidatePath('/admin');
        revalidatePath('/admin/places');
        return { success: true };
    } catch (error) {
        console.error("Failed to increment lead count (stub):", error);
        return { success: false, message: 'Failed to increment lead count.' };
    }
}


// --- Campaign Actions ---

export async function createCampaign(formData: FormData) {
    console.log("(Stub) Creating campaign with data:", Object.fromEntries(formData.entries()));
    revalidatePath('/admin/campaigns');
    return { success: true, message: 'Campaign created successfully (mock).' };
}

export async function deleteCampaign(campaignId: string) {
    console.log(`(Stub) Deleting campaign ${campaignId}`);
    revalidatePath('/admin/campaigns');
    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true, message: 'Campaign deleted successfully (mock).' };
}


// --- Place Actions ---

export async function createPlace(formData: FormData) {
    console.log("(Stub) Creating place with data:", Object.fromEntries(formData.entries()));
    revalidatePath('/admin/places');
    return { success: true, message: 'Place created successfully (mock).' };
}

export async function deletePlace(placeId: string) {
    console.log(`(Stub) Deleting place ${placeId}`);
    revalidatePath('/admin/places');
    return { success: true, message: 'Place deleted successfully (mock).' };
}


// --- Campaign Source Actions ---

export async function addSourceToCampaign(formData: FormData) {
    const campaignId = formData.get('campaignId') as string;
    console.log(`(Stub) Adding source to campaign ${campaignId}`);
    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true, message: 'Source added to campaign successfully (mock).' };
}


export async function deleteCampaignSource(campaignSourceId: string, campaignId: string) {
    console.log(`(Stub) Deleting campaign source ${campaignSourceId}`);
    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true, message: 'Campaign source deleted successfully (mock).' };
}

// --- Discount Actions ---
export async function createDiscount(formData: FormData) {
    console.log("(Stub) Creating discount:", Object.fromEntries(formData.entries()));
    revalidatePath('/admin/discounts');
    return { success: true, message: 'Discount created successfully (mock).' };
}

// --- Branch Actions ---
export async function createBranch(formData: FormData) {
    console.log("(Stub) Creating branch:", Object.fromEntries(formData.entries()));
    revalidatePath('/admin/branches');
    return { success: true, message: 'Branch created successfully (mock).' };
}

export async function deleteBranch(branchId: string) {
    console.log(`(Stub) Deleting branch ${branchId}`);
    revalidatePath('/admin/branches');
    return { success: true, message: 'Branch deleted successfully (mock).' };
}


// --- Lead Actions ---

export async function getLeadCreationContext(campaignId: string, sourceId: string) {
  try {
    // Increment the scan count for the specific QR code that was scanned.
    await incrementScanCount(sourceId);
    
    const campaign = await getCampaignById(campaignId);
    const places = await getPlaces();
    const campaignSources = await getCampaignSourcesData('');
    const campaignSource = campaignSources.find(cs => cs.id === sourceId);
    
    if (!campaignSource) {
      throw new Error('Campaign source not found');
    }
    
    const place = places.find(p => p.id === campaignSource.sourceId);

    if (!campaign || !place) {
      throw new Error('Campaign or Place not found');
    }
    
    return {
      success: true,
      branchId: campaign.branchId,
      placeId: place.id,
      category: place.category,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: message };
  }
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
    revalidatePath('/admin/leads');
    return { success: true, message: 'Lead updated successfully.' };

  } catch (error) {
    console.error('Failed to update lead:', error);
    return { success: false, message: 'Failed to update lead.' };
  }
}
