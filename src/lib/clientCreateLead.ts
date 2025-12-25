
"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { incrementLeadCount } from "./actions";

export async function clientCreateLead(leadData: any) {
  if (!db) {
    throw new Error("Firestore DB not initialized");
  }

  // The leadData already contains the necessary fields from the context action
  // The timeline is also now passed in from the client component
  const docRef = await addDoc(collection(db, "leads"), {
    ...leadData,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  // After successful lead creation, update the JSON-based lead count
  if (docRef.id && leadData.sourceId) {
    await incrementLeadCount(leadData.sourceId);
  }

  return docRef;
}
