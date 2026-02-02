// Test script updated to use Firebase instead of PostgreSQL
const { CertificateService } = require('../lib/certificateService');

async function testFirebaseConnection() {
  console.log('🔍 Testing Firebase Connection...');
  
  try {
    // Test by fetching some certificates
    const certificates = await CertificateService.getAllCertificates();
    
    console.log(`✅ Firebase connected successfully!`);
    console.log(`📊 Found ${certificates.length} certificates in collection`);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}

async function testCertificatesCollection() {
  console.log('\n🔍 Testing Certificates Collection...');
  
  try {
    // Try to fetch certificates from Firebase
    const certificates = await CertificateService.getAllCertificates();
    
    console.log(`✅ Certificates collection accessible!`);
    console.log(`📊 Found ${certificates.length} certificates in collection`);
    
    if (certificates.length > 0) {
      console.log('\n📋 Existing Certificates:');
      certificates.slice(0, 5).forEach((cert, index) => {
        console.log(`   ${index + 1}. ${cert.name} (${cert.universityCode}) - ${cert.eventName}`);
      });
      
      if (certificates.length > 5) {
        console.log(`   ... and ${certificates.length - 5} more certificates`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Certificates collection test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 DEXTRA Firebase Connection Test\n');
  
  const firebaseOk = await testFirebaseConnection();
  const collectionOk = await testCertificatesCollection();
  
  console.log('\n🎯 Connection Summary:');
  console.log(`   🔥 Firebase: ${firebaseOk ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   📋 Certificates Collection: ${collectionOk ? '✅ Accessible' : '❌ Failed'}`);
  
  if (firebaseOk && collectionOk) {
    console.log('\n🎉 All Firebase services are working!');
    console.log('✅ Ready for certificate management');
  } else {
    console.log('\n⚠️  Some Firebase services are not working.');
    console.log('Please check your Firebase configuration.');
  }
}

// Run the test
main().catch(console.error);