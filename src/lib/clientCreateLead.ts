"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function clientCreateLead(leadData: any) {
  if (!db) {
    throw new Error("Firestore DB not initialized");
  }

  // The leadData should already contain the serverTimestamp() fields
  return await addDoc(collection(db, "leads"), leadData);
}
