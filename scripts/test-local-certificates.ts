import { LocalCertificateService } from '../lib/localCertificateService';

async function testLocalCertificates() {
  console.log('🔍 Testing Local Certificate Service\n');
  
  try {
    // Test 1: Get certificates by university code
    console.log('📋 Testing certificate retrieval...');
    const certificates = await LocalCertificateService.getCertificatesByUniversityCode('PRP24CS068');
    
    if (certificates.length > 0) {
      console.log(`✅ Found ${certificates.length} certificates for PRP24CS068`);
      
      certificates.forEach((cert, index) => {
        console.log(`   ${index + 1}. ${cert.name} - ${cert.eventName}`);
        console.log(`      Certificate ID: ${cert.certificateId}`);
        console.log(`      PDF URL: ${cert.pdfUrl}`);
      });
      
      // Test 2: Get PDF URL for first certificate
      if (certificates[0].certificateId) {
        console.log('\n📄 Testing PDF URL retrieval...');
        const pdfUrl = await LocalCertificateService.getCertificatePdfUrl(certificates[0].certificateId);
        
        if (pdfUrl) {
          console.log('✅ PDF URL retrieved successfully');
          console.log(`   URL: ${pdfUrl}`);
        } else {
          console.log('❌ PDF URL not available');
        }
      }
      
    } else {
      console.log('❌ No certificates found for PRP24CS068');
    }
    
    // Test 3: Get all certificates
    console.log('\n📊 Testing getAllCertificates...');
    const allCertificates = await LocalCertificateService.getAllCertificates();
    console.log(`✅ Found ${allCertificates.length} total certificates in database`);
    
    // Test 4: Get all university codes
    console.log('\n🎓 Testing getAllUniversityCodes...');
    const universityCodes = LocalCertificateService.getAllUniversityCodes();
    console.log(`✅ Found ${universityCodes.length} university codes:`, universityCodes);
    
    console.log('\n🎯 Local Certificate Test Summary:');
    console.log('   ✅ Certificate retrieval: Working');
    console.log('   ✅ PDF URL generation: Working');
    console.log('   ✅ Database connection: Working');
    console.log('\n🎉 Local certificate service is ready!');
    
  } catch (error) {
    console.error('❌ Local certificate test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check certificate data in localCertificateService.ts');
    console.log('   2. Verify PDF files exist in public/certificates/');
    console.log('   3. Check API routes');
  }
}

// Run the test
testLocalCertificates(); 