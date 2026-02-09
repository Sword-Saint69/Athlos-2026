import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAW163OAlot-b7JBcdNsyu8Wwe-leMkuW4",
    authDomain: "certificate-827e0.firebaseapp.com",
    projectId: "certificate-827e0",
    storageBucket: "certificate-827e0.firebasestorage.app",
    messagingSenderId: "555508215460",
    appId: "1:555508215460:web:a8844eff62a027d67cc031",
    measurementId: "G-X24JQ9BJFW"
};

async function probeDatabase() {
    console.log('🚀 Probing specific database: certificate-827e0');

    const app = initializeApp(firebaseConfig, 'probe-app');
    const db = getFirestore(app);

    const collectionsToTry = [
        'certificates',
        'certificates-final',
        'Certificates',
        'athletes',
        'results',
        'test',
        'scorecard',
        'winners'
    ];

    for (const colName of collectionsToTry) {
        try {
            console.log(`\n🔍 Checking collection: "${colName}"...`);
            const colRef = collection(db, colName);
            const q = query(colRef, limit(5));
            const snapshot = await getDocs(q);

            if (snapshot.size > 0) {
                console.log(`✅ FOUND ${snapshot.size} documents (showing up to 5)`);
                snapshot.forEach(doc => {
                    console.log(`\nDocument ID: ${doc.id}`);
                    console.log('Data:', JSON.stringify(doc.data(), null, 2));
                });
            } else {
                console.log(`❌ No documents found in "${colName}"`);
            }
        } catch (error) {
            console.error(`⚠️ Error checking "${colName}":`, error.message);
        }
    }
}

probeDatabase().catch(console.error);
