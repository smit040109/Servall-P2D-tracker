import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function createLead(leadData: any) {
  if (!db) {
    throw new Error("Firestore DB not initialized");
  }

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

  return await addDoc(collection(db, "leads"), newLead);
}
