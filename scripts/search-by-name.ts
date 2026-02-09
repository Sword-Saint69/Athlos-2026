import { db1, db2 } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function searchByName() {
    const nameToSearch = "MILAN J";
    const dbs = [
        { name: 'DB1 (athlos26)', instance: db1 },
        { name: 'DB2 (certificate-827e0)', instance: db2 }
    ];

    const collections = ['certificates', 'certificates-final', 'Certificates', 'athletes'];

    console.log(`🚀 Searching for Name: "${nameToSearch}"...`);

    for (const dbInfo of dbs) {
        console.log(`\n===== Checking ${dbInfo.name} =====`);
        for (const colName of collections) {
            try {
                console.log(`🔍 Collection: "${colName}"`);
                const colRef = collection(dbInfo.instance, colName);

                // Try searching by "Full Name"
                const q1 = query(colRef, where('Full Name', '==', nameToSearch));
                const s1 = await getDocs(q1);
                if (s1.size > 0) {
                    console.log(`✅ Found ${s1.size} docs by "Full Name" in ${colName}`);
                    s1.forEach(doc => console.log(JSON.stringify(doc.data(), null, 2)));
                }

                // Try searching by "name"
                const q2 = query(colRef, where('name', '==', nameToSearch));
                const s2 = await getDocs(q2);
                if (s2.size > 0) {
                    console.log(`✅ Found ${s2.size} docs by "name" in ${colName}`);
                    s2.forEach(doc => console.log(JSON.stringify(doc.data(), null, 2)));
                }
            } catch (e) {
                console.log(`⚠️ Error in ${colName}: ${e.message}`);
            }
        }
    }
}

searchByName().catch(console.error);
