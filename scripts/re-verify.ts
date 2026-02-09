import { db2 } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function searchOriginal() {
    const searchId1 = "PRP24CS087";
    const certificatesRef = collection(db2, 'certificates');

    console.log(`🚀 Original search for "${searchId1}" in DB2: certificates`);

    try {
        const q1 = query(certificatesRef, where('SEARCH ID 1', '==', searchId1));
        const querySnapshot1 = await getDocs(q1);

        if (querySnapshot1.size > 0) {
            console.log(`✅ FOUND match! Size: ${querySnapshot1.size}`);
            querySnapshot1.forEach(doc => {
                console.log('Data:', JSON.stringify(doc.data(), null, 2));
            });
        } else {
            console.log('❌ No results for SEARCH ID 1');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

searchOriginal().catch(console.error);
