const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, limit } = require("firebase/firestore");

// Manual config for quick execution if env is not loaded
// These values are from the user's previous request
const firebaseConfig = {
    apiKey: "AIzaSyAQmP7mu9SG3-xpgr5kL4ztYxSZeVELaCE",
    authDomain: "athloscertificate.firebaseapp.com",
    projectId: "athloscertificate",
    storageBucket: "athloscertificate.firebasestorage.app",
    messagingSenderId: "359646068565",
    appId: "1:359646068565:web:7000c81aa25911404e39dc",
    measurementId: "G-SVJVNE63R8"
};

async function probeDatabase() {
    console.log("-----------------------------------------");
    console.log(`🚀 Probing DB2 Project: ${firebaseConfig.projectId}`);
    console.log("-----------------------------------------");

    const app = initializeApp(firebaseConfig, "db2-probe-" + Date.now());
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
    }

    for (const colName of collectionsToProbe) {
        try {
            process.stdout.write(`📂 Checking collection: "${colName}"... `);
            const colRef = collection(db, colName);
            const snapshot = await getDocs(query(colRef, limit(searchTerm ? 500 : 20)));

            if (snapshot.size > 0) {
                console.log(`✅ Found ${snapshot.size} documents.`);
                let matchCount = 0;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const dataStr = JSON.stringify(data).toUpperCase();

                    if (!searchTerm || dataStr.includes(searchTerm)) {
                        matchCount++;
                        console.log(`\n--- [ID: ${doc.id}] ---`);
                        console.log(JSON.stringify(data, null, 2));
                    }
                });
                if (searchTerm && matchCount === 0) {
                    console.log(`ℹ️ No documents matched the search term "${searchTerm}" in this collection.`);
                }
            } else {
                console.log(`⚪ Empty.`);
            }
        } catch (error) {
            console.log(`⚠️ Error: ${error.message}`);
        }
    }
    console.log("\n-----------------------------------------");
    console.log("✅ Probe completed.");
    console.log("-----------------------------------------");
    process.exit(0);
}

probeDatabase().catch(err => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
