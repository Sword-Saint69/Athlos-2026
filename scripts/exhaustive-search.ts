import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAW163OAlot-b7JBcdNsyu8Wwe-leMkuW4",
    authDomain: "certificate-827e0.firebaseapp.com",
    projectId: "certificate-827e0",
    storageBucket: "certificate-827e0.firebasestorage.app",
    messagingSenderId: "555508215460",
    appId: "1:555508215460:web:a8844eff62a027d67cc031",
    measurementId: "G-X24JQ9BJFW"
};

async function exhaustiveSearch() {
    const searchTerm = "PRP24CS087";
    const collectionsToSearch = ['certificates', 'certificates-final', 'Certificates'];

    const app = initializeApp(firebaseConfig, 'exhaustive-app');
    const db = getFirestore(app);

    console.log(`🚀 Exhaustive search for "${searchTerm}" in certificate-827e0...`);

    for (const colName of collectionsToSearch) {
        console.log(`\n🔍 Checking collection: "${colName}"`);
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(colRef);
            console.log(`   Found ${snapshot.size} documents.`);

            let matchCount = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                const dataStr = JSON.stringify(data);
                if (dataStr.includes(searchTerm)) {
                    console.log(`   🎯 MATCH FOUND in doc ID: ${doc.id}`);
                    console.log('   Data:', JSON.stringify(data, null, 2));
                    matchCount++;
                }
            });
            console.log(`   Matches in "${colName}": ${matchCount}`);
        } catch (e) {
            console.log(`   ⚠️ Error in "${colName}": ${e.message}`);
        }
    }
}

exhaustiveSearch().catch(console.error);
