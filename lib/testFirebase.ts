// Test Firebase connection and event operations
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function testFirebaseConnection() {
  try {
    // Test reading events
    const eventsQuery = query(collection(db, "events"));
    const snapshot = await getDocs(eventsQuery);
    console.log(`Found ${snapshot.size} events in database`);
    
    // Test adding a temporary event
    const testEvent = {
      name: "Test Event",
      category: "Track",
      eventId: "TEST-001",
      maxParticipants: 5,
      status: "upcoming" as const,
      createdAt: new Date(),
      test: true
    };
    
    const docRef = await addDoc(collection(db, "events"), testEvent);
    console.log("Test event added with ID:", docRef.id);
    
    // Test updating the event
    await updateDoc(doc(db, "events", docRef.id), {
      name: "Updated Test Event"
    });
    console.log("Test event updated successfully");
    
    // Test deleting the event
    await deleteDoc(doc(db, "events", docRef.id));
    console.log("Test event deleted successfully");
    
    return { success: true, message: "Firebase connection and operations working correctly" };
  } catch (error) {
    console.error("Firebase test failed:", error);
    return { success: false, message: (error as Error).message };
  }
}