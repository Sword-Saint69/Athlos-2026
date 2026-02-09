const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Firebase configuration for Database 2 (athloscertificate)
const firebaseConfig = {
    apiKey: "AIzaSyAQmP7mu9SG3-xpgr5kL4ztYxSZeVELaCE",
    authDomain: "athloscertificate.firebaseapp.com",
    projectId: "athloscertificate",
    storageBucket: "athloscertificate.firebasestorage.app",
    messagingSenderId: "359646068565",
    appId: "1:359646068565:web:7000c81aa25911404e39dc",
    measurementId: "G-SVJVNE63R8"
};

async function exportCertificates() {
    console.log("-----------------------------------------");
    console.log(`🚀 Exporting Certificates from: ${firebaseConfig.projectId}`);
    console.log("-----------------------------------------");

    const app = initializeApp(firebaseConfig, "db2-export-" + Date.now());
    const db = getFirestore(app);

    try {
        console.log(`📂 Fetching "certificates" collection...`);
        const colRef = collection(db, 'certificates');
        const snapshot = await getDocs(colRef);

        if (snapshot.size > 0) {
            console.log(`✅ Found ${snapshot.size} documents.`);
            const certificates = [];

            snapshot.forEach(doc => {
                certificates.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            const outputPath = path.resolve(process.cwd(), "exported_certificates.json");
            fs.writeFileSync(outputPath, JSON.stringify(certificates, null, 2));

            console.log(`\n🎉 Success! Exported ${certificates.length} certificates to:`);
            console.log(outputPath);
        } else {
            console.log(`\n⚪ No certificates found to export.`);
        }
    } catch (error) {
        console.error(`\n❌ Error during export: ${error.message}`);
    }

    console.log("-----------------------------------------");
    process.exit(0);
}

exportCertificates().catch(err => {
    console.error("❌ Export script failed:", err);
    process.exit(1);
});
