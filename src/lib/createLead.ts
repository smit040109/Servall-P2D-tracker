import { addDoc, collection, doc, getDocs, query, serverTimestamp, writeBatch, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Customer } from "./types";

export async function createLead(leadData: any) {
  if (!db) {
    throw new Error("Firestore DB not initialized");
  }

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

    batch.update(customerRef, {
        lastVisitDate: serverTimestamp(),
        totalVisits: customerData.totalVisits + 1,
        associatedLeadIds: [...customerData.associatedLeadIds, newLeadRef.id]
    });
  }

  // 3. Commit all operations
  await batch.commit();

  return newLeadRef;
}
