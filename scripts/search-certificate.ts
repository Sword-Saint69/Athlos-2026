import { db1, db2 } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function searchCertificates() {
    const searchId1 = "PRP24CS087";
    const searchId2 = "7012881003";

    console.log('🚀 Searching for certificates in DB2 (certificates collection)...');
    console.log(`🔍 Search ID 1: ${searchId1}`);
    console.log(`🔍 Search ID 2: ${searchId2}`);

    try {
        const certificatesRef = collection(db2, 'certificates');

        // Check for SEARCH ID 1
        console.log('\n--- Checking SEARCH ID 1 ---');
        const q1 = query(certificatesRef, where('SEARCH ID 1', '==', searchId1));
        const querySnapshot1 = await getDocs(q1);

        if (querySnapshot1.size > 0) {
            console.log(`✅ Found ${querySnapshot1.size} certificates for SEARCH ID 1`);
            querySnapshot1.forEach((doc) => {
                console.log(`Document ID: ${doc.id}`);
                console.log('Data:', JSON.stringify(doc.data(), null, 2));
            });
        } else {
            console.log('❌ No results for SEARCH ID 1');
        }

        // Check for SEARCH ID 2
        console.log('\n--- Checking SEARCH ID 2 ---');
        const q2 = query(certificatesRef, where('SEARCH ID 2', '==', searchId2));
        const querySnapshot2 = await getDocs(q2);

        if (querySnapshot2.size > 0) {
            console.log(`✅ Found ${querySnapshot2.size} certificates for SEARCH ID 2`);
            querySnapshot2.forEach((doc) => {
                console.log(`Document ID: ${doc.id}`);
                console.log('Data:', JSON.stringify(doc.data(), null, 2));
            });
        } else {
            console.log('❌ No results for SEARCH ID 2');
        }

        // DEBUG: Check database project IDs
        console.log(`\nProject ID DB1: ${db1.app.options.projectId}`);
        console.log(`Project ID DB2: ${db2.app.options.projectId}`);

        const dbs = [{ name: 'db1', instance: db1 }, { name: 'db2', instance: db2 }];

        for (const dbObj of dbs) {
            console.log(`\n===== Probing Database: ${dbObj.name} (${dbObj.instance.app.options.projectId}) =====`);

            const collectionsToProbe = [
                'certificates', 'certificates-final', 'Certificates',
                'results', 'athletes', 'registrations', 'events',
                'scores', 'users', 'admins', 'logs'
            ];

            for (const colName of collectionsToProbe) {
                try {
                    const colRef = collection(dbObj.instance, colName);
                    const snapshot = await getDocs(colRef);
                    process.stdout.write(`  Checking "${colName}"... `);
                    if (snapshot.size > 0) {
                        console.log(`✅ FOUND ${snapshot.size} docs!`);
                        const data = snapshot.docs[0].data();
                        console.log(`    Sample: ID=${snapshot.docs[0].id}, Name="${data['Full Name'] || data.name}", SearchID1="${data['SEARCH ID 1'] || data.search_id}"`);

                        // If we found docs, let's also try the specific query here
                        const q1 = query(colRef, where('SEARCH ID 1', '==', searchId1));
                        const q1Snap = await getDocs(q1);
                        if (q1Snap.size > 0) {
                            console.log(`    🎯 MATCH FOUND in "${colName}" for SEARCH ID 1!`);
                        }
                    } else {
                        console.log(`empty`);
                    }
                } catch (e) {
                    console.log(`error: ${e.message}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Search failed:', error);
    }
}

searchCertificates().catch(console.error);
