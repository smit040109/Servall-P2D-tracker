"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function clientCreateLead(leadData: any) {
  if (!db) {
    throw new Error("Firestore DB not initialized");
  }

  return await addDoc(collection(db, "leads"), {
    ...leadData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}
