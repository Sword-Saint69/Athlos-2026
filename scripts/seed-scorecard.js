// Script to add sample team data and stats to Firebase for the Scorecard page
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc } = require('firebase/firestore');

// Firebase configuration
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

async function seedScorecard() {
    try {
        const teams = [
            {
                name: "AGNI",
                sector: "CORE INFERNO",
                points: 4820,
                medals: { gold: 24, silver: 18, bronze: 12 },
                color: "#f20d0d"
            },
            {
                name: "ASTRA",
                sector: "CELESTIAL VELOCITY",
                points: 4150,
                medals: { gold: 19, silver: 22, bronze: 15 },
                color: "#0d6ef2"
            },
            {
                name: "VAJRA",
                sector: "THUNDERBOLT IMPACT",
                points: 3890,
                medals: { gold: 15, silver: 14, bronze: 20 },
                color: "#f2d60d"
            },
            {
                name: "RUDRA",
                sector: "STORM RESILIENCE",
                points: 3420,
                medals: { gold: 12, silver: 16, bronze: 18 },
                color: "#f27c0d"
            }
        ];

        console.log("Seeding teams...");
        for (const team of teams) {
            await setDoc(doc(db, "teams", team.name.toLowerCase()), team);
            console.log(`Added/Updated team: ${team.name}`);
        }

        const stats = {
            totalAthletes: 1402,
            eventsCompleted: "84/120",
            syncFrequency: "0.2s",
            lastUpdate: new Date().toISOString()
        };

        console.log("Seeding global stats...");
        await setDoc(doc(db, "system", "stats"), stats);

        console.log("Scorecard data seeded successfully!");
    } catch (error) {
        console.error("Error seeding scorecard data:", error);
    }
}

seedScorecard();
