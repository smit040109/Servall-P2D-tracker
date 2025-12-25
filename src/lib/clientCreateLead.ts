"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function clientCreateLead(leadData: any) {
  if (!db) {
    throw new Error("Firestore DB not initialized");
  }

  // The leadData already contains the necessary fields from the context action
  return addDoc(collection(db, "leads"), {
    ...leadData,
    status: 'pending',
    createdAt: serverTimestamp(),
    timeline: [
        { event: "FORM_SUBMITTED", timestamp: new Date(), source: "customer" },
    ],
  });
}
