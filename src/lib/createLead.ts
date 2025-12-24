import { addDoc, collection, doc, getDocs, query, serverTimestamp, writeBatch, where, arrayUnion } from "firebase/firestore";
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
  try {
    const campaignSourcesPath = path.join(process.cwd(), 'src', 'lib', 'data', 'campaignSources.json');
    const campaignSources: CampaignSource[] = JSON.parse(await fs.readFile(campaignSourcesPath, 'utf-8'));
    
    const sourceIndex = campaignSources.findIndex(cs => cs.id === leadData.sourceId);
    
    if (sourceIndex !== -1) {
      campaignSources[sourceIndex].scans += 1;
      campaignSources[sourceIndex].leads += 1;

      await fs.writeFile(campaignSourcesPath, JSON.stringify(campaignSources, null, 2));
    }
  } catch (error) {
    console.error("Failed to update scan/lead counts:", error);
  }
  // --- End Scan/Lead Count Update ---

  const places = await readData<Place[]>('places.json');
  const campaignSources = await readData<CampaignSource[]>('campaignSources.json');
  
  const campaignSource = campaignSources.find(cs => cs.id === leadData.sourceId);
  const place = campaignSource ? places.find(p => p.id === campaignSource.sourceId) : undefined;

  const batch = writeBatch(db);
  const leadsRef = collection(db, "leads");
  const newLeadRef = doc(leadsRef);

  const newLead: any = {
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
    category: place?.category || 'Unknown',
    location: place?.name || 'Unknown',
  };

  // Only add pincode if it's not empty
  if (!leadData.pincode) {
    delete newLead.pincode;
  }

  batch.set(newLeadRef, newLead);

  const customersRef = collection(db, "customers");
  const q = query(customersRef, where("phone", "==", leadData.phone));
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    const newCustomerRef = doc(customersRef);
    const newCustomer: Omit<Customer, 'id'> = {
        name: leadData.name,
        phone: leadData.phone,
        firstVisitDate: serverTimestamp(),
        lastVisitDate: serverTimestamp(),
        totalVisits: 1,
        totalEncashments: 0,
        associatedLeadIds: [newLeadRef.id]
    };
    if (leadData.pincode) {
        newCustomer.pincode = leadData.pincode;
    }
    batch.set(newCustomerRef, newCustomer);
  } else {
    const customerDoc = querySnapshot.docs[0];
    const customerRef = doc(db, "customers", customerDoc.id);
    const customerData = customerDoc.data() as Customer;

    const updateData: any = {
        lastVisitDate: serverTimestamp(),
        totalVisits: (customerData.totalVisits || 0) + 1,
        associatedLeadIds: arrayUnion(newLeadRef.id)
    };

    if (!customerData.pincode && leadData.pincode) {
        updateData.pincode = leadData.pincode;
    }

    batch.update(customerRef, updateData);
  }

  await batch.commit();

  return newLeadRef;
}
