import { addDoc, collection, doc, getDocs, query, serverTimestamp, writeBatch, where, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Customer, Place, CampaignSource } from "./types";
import { promises as fs } from 'fs';
import path from 'path';

async function readData<T>(filename: string): Promise<T> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'data', filename);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent) as T;
}

export async function createLead(leadData: any) {
  if (!db) {
    throw new Error("Firestore DB not initialized");
  }

  // --- Start Scan/Lead Count Update ---
  // In a real high-concurrency app, this would be a cloud function.
  // For this project, a server-side read/write is acceptable.
  try {
    const campaignSourcesPath = path.join(process.cwd(), 'src', 'lib', 'data', 'campaignSources.json');
    const campaignSources: CampaignSource[] = JSON.parse(await fs.readFile(campaignSourcesPath, 'utf-8'));
    
    const sourceIndex = campaignSources.findIndex(cs => cs.id === leadData.sourceId);
    
    if (sourceIndex !== -1) {
      // In this simulated flow, a lead submission implies a scan.
      // A more complex system might separate these actions.
      campaignSources[sourceIndex].scans += 1;
      campaignSources[sourceIndex].leads += 1;

      await fs.writeFile(campaignSourcesPath, JSON.stringify(campaignSources, null, 2));
    }
  } catch (error) {
    console.error("Failed to update scan/lead counts:", error);
    // Continue with lead creation even if file-based counts fail
  }
  // --- End Scan/Lead Count Update ---


  // Fetch Place and CampaignSource details to denormalize onto the lead
  const places = await readData<Place[]>('places.json');
  const campaignSources = await readData<CampaignSource[]>('campaignSources.json');
  
  const campaignSource = campaignSources.find(cs => cs.id === leadData.sourceId);
  const place = campaignSource ? places.find(p => p.id === campaignSource.sourceId) : undefined;

  const batch = writeBatch(db);
  const leadsRef = collection(db, "leads");
  const newLeadRef = doc(leadsRef);

  // 1. Define the new lead
  const newLead = {
    ...leadData,
    status: "pending",
    createdAt: serverTimestamp(),
    timeline: [
      {
        event: "Form Submitted",
        timestamp: serverTimestamp(),
        source: "System",
      },
    ],
    // Denormalized fields for easier querying
    category: place?.category || 'Unknown',
    location: place?.name || 'Unknown',
  };
  batch.set(newLeadRef, newLead);

  // 2. Check for an existing customer and update/create them
  const customersRef = collection(db, "customers");
  const q = query(customersRef, where("phone", "==", leadData.phone));
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // New customer
    const newCustomerRef = doc(customersRef);
    const newCustomer: Omit<Customer, 'id'> = {
        phone: leadData.phone,
        pincode: leadData.pincode,
        firstVisitDate: serverTimestamp(),
        lastVisitDate: serverTimestamp(),
        totalVisits: 1,
        totalEncashments: 0,
        associatedLeadIds: [newLeadRef.id]
    };
    batch.set(newCustomerRef, newCustomer);
  } else {
    // Repeat customer
    const customerDoc = querySnapshot.docs[0];
    const customerRef = doc(db, "customers", customerDoc.id);
    const customerData = customerDoc.data() as Customer;

    const updateData: any = {
        lastVisitDate: serverTimestamp(),
        totalVisits: (customerData.totalVisits || 0) + 1,
        associatedLeadIds: [...(customerData.associatedLeadIds || []), newLeadRef.id]
    };

    // Only update pincode if it's not already set
    if (!customerData.pincode && leadData.pincode) {
        updateData.pincode = leadData.pincode;
    }

    batch.update(customerRef, updateData);
  }

  // 3. Commit all operations
  await batch.commit();

  return newLeadRef;
}
