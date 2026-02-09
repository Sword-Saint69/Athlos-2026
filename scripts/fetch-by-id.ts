import { db2 } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function fetchById() {
    const docId = "0583161c56cc447990b764c673ff5240";
    console.log(`🚀 Fetching doc "${docId}" from DB2: certificates`);

    try {
        const docRef = doc(db2, 'certificates', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log('✅ FOUND document!');
            console.log('Data:', JSON.stringify(docSnap.data(), null, 2));
        } else {
            console.log('❌ Document does not exist.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fetchById().catch(console.error);
