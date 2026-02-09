import { db1, db2 } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function finalProbe() {
    const searchTerm = "MILAN";
    const dbs = [
        { name: 'DB1 (athlos26)', instance: db1 },
        { name: 'DB2 (certificate-827e0)', instance: db2 }
    ];

    const colNames = ['certificates', 'certificates-final', 'Certificates', 'athletes', 'registrations'];

    console.log(`🚀 Final Probe: Searching for any document containing "${searchTerm}"...`);

    for (const dbInfo of dbs) {
        console.log(`\n===== Probing ${dbInfo.name} =====`);
        for (const colName of colNames) {
            try {
                const colRef = collection(dbInfo.instance, colName);
                const snapshot = await getDocs(colRef);

                if (snapshot.size > 0) {
                    console.log(`🔍 Collection "${colName}" has ${snapshot.size} docs. Searching...`);
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const dataStr = JSON.stringify(data).toUpperCase();
                        if (dataStr.includes(searchTerm)) {
                            console.log(`   🎯 MATCH FOUND in doc ID: ${doc.id}`);
                            console.log('   Data:', JSON.stringify(data, null, 2));
                        }
                    });
                } else {
                    // console.log(`   Collection "${colName}" is empty.`);
                }
            } catch (e) {
                console.log(`   ⚠️ Error in "${colName}": ${e.message}`);
            }
        }
    }
}

finalProbe().catch(console.error);
