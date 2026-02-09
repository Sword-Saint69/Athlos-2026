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

async function listAllCertificates() {
    console.log('🚀 Listing all documents in DB2: certificates');

    const app = initializeApp(firebaseConfig, 'list-app');
    const db = getFirestore(app);

    try {
        const colRef = collection(db, 'certificates');
        const snapshot = await getDocs(colRef);

        console.log(`📊 Snapshot size: ${snapshot.size}`);

        if (snapshot.size > 0) {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`\nDocument ID: ${doc.id}`);
                console.log(`Full Name: "${data['Full Name'] || data.name}"`);
                console.log(`SEARCH ID 1: "${data['SEARCH ID 1']}"`);
                console.log(`SEARCH ID 2: "${data['SEARCH ID 2']}"`);
            });
        } else {
            console.log('❌ No documents found in "certificates" collection.');
        }
    } catch (error) {
        console.error('⚠️ Error:', error.message);
    }
}

listAllCertificates().catch(console.error);
