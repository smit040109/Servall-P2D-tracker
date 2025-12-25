"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export default function FirestoreTest() {
  async function testWrite() {
    console.log("DB object:", db);

    try {
      const ref = await addDoc(collection(db, "test"), {
        hello: "world",
        time: serverTimestamp(),
      });
      alert("Firestore working: " + ref.id);
    } catch (e: any) {
      console.error(e);
      alert("Firestore FAILED: " + e.message);
    }
  }

  return (
    <button 
      onClick={testWrite} 
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg my-4"
    >
      TEST FIRESTORE
    </button>
  );
}
