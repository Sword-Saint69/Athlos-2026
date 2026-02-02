// Script to add sample events to Firebase for testing
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addSampleEvents() {
  try {
    const sampleEvents = [
      {
        name: "100m Sprint",
        category: "Track",
        eventId: "TRK-001",
        maxParticipants: 8,
        status: "upcoming",
        createdAt: new Date()
      },
      {
        name: "Long Jump",
        category: "Jumping",
        eventId: "JMP-001",
        maxParticipants: 12,
        status: "upcoming",
        createdAt: new Date()
      },
      {
        name: "Shot Put",
        category: "Throwing",
        eventId: "THR-001",
        maxParticipants: 10,
        status: "active",
        createdAt: new Date()
      },
      {
        name: "High Jump",
        category: "Jumping",
        eventId: "JMP-002",
        maxParticipants: 12,
        status: "completed",
        createdAt: new Date()
      }
    ];

    console.log("Adding sample events to Firebase...");
    
    for (const event of sampleEvents) {
      const docRef = await addDoc(collection(db, "events"), event);
      console.log(`Added event: ${event.name} with ID: ${docRef.id}`);
    }

    console.log("Sample events added successfully!");
  } catch (error) {
    console.error("Error adding sample events:", error);
  }
}

// Run the function
addSampleEvents();