import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_2_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_2_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_2_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_2_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_2_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_2_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_2_MEASUREMENT_ID,
};

async function probeDatabase() {
    console.log(`🚀 Probing DB2: ${firebaseConfig.projectId}`);

    if (!firebaseConfig.apiKey) {
        console.error("❌ Error: Firebase config not found in .env.local");
        process.exit(1);
    }

    const app = initializeApp(firebaseConfig, "db2-probe");
    const db = getFirestore(app);

    const collectionsToProbe = [
        "certificates",
        "certificates-final",
        "registrations",
        "athletes",
        "events",
        "winners"
    ];

    const searchTerm = process.argv[2]?.toUpperCase();
    if (searchTerm) {
        console.log(`🔍 Searching for strings containing: "${searchTerm}"`);
    } else {
        console.log("📝 No search term provided. Listing first few documents from each collection.");
    }

    for (const colName of collectionsToProbe) {
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(query(colRef, limit(searchTerm ? 1000 : 10)));

            if (snapshot.size > 0) {
                console.log(`\n✅ Collection "${colName}" has ${snapshot.size} docs (showing up to ${searchTerm ? 'all' : '10'}).`);
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const dataStr = JSON.stringify(data).toUpperCase();

                    if (!searchTerm || dataStr.includes(searchTerm)) {
                        console.log(`--- [${doc.id}] ---`);
                        console.log(JSON.stringify(data, null, 2));
                    }
                });
            } else {
                console.log(`\n⚪ Collection "${colName}" is empty.`);
            }
        } catch (error) {
            console.log(`\n⚠️  Error probing "${colName}": ${error.message}`);
        }
    }
}

probeDatabase().catch(console.error);
