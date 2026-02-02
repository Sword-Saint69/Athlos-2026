import { db, storage } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';

async function testFirestoreConnection() {
  console.log('🔍 Testing Firestore Connection...');
  
  try {
    const certificatesRef = collection(db, 'certificates');
    const snapshot = await getDocs(certificatesRef);
    
    console.log(`✅ Firestore connected successfully!`);
    console.log(`📊 Found ${snapshot.size} certificates in database`);
    
    if (snapshot.size > 0) {
      console.log('\n📋 Existing Certificates:');
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${data.name} (${data.universityCode}) - ${data.eventName}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return false;
  }
}

async function testStorageConnection() {
  console.log('\n🔍 Testing Firebase Storage Connection...');
  
  try {
    const certificatesRef = ref(storage, 'certificates');
    const result = await listAll(certificatesRef);
    
    console.log(`✅ Firebase Storage connected successfully!`);
    console.log(`📁 Found ${result.items.length} PDF files in storage`);
    
    if (result.items.length > 0) {
      console.log('\n📋 Existing PDF Files:');
      result.items.forEach((item) => {
        console.log(`   - ${item.name}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firebase Storage connection failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 DEXTRA Firebase Connection Test\n');
  
  const firestoreOk = await testFirestoreConnection();
  const storageOk = await testStorageConnection();
  
  console.log('\n🎯 Connection Summary:');
  console.log(`   🔥 Firestore: ${firestoreOk ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   📁 Storage: ${storageOk ? '✅ Connected' : '❌ Failed'}`);
  
  if (firestoreOk && storageOk) {
    console.log('\n🎉 All Firebase services are working!');
    console.log('✅ Ready for certificate uploads');
  } else {
    console.log('\n⚠️  Some Firebase services are not working.');
    console.log('Please check your Firebase configuration and rules.');
  }
}

// Run the test
main().catch(console.error); 