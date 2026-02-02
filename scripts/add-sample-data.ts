const { initializeTable, addCertificate } = require('../lib/certificateServicePostgres.js');

const sampleCertificates = [
  {
    name: "Goutham Sankar",
    eventName: "DEXTRA Annual Arts Fest 2025",
    certificateId: "DEXTRA25-GS-001",
    universityCode: "PRP24CS068",
    department: "Computer Science",
    year: "2024"
  },
];

async function addSampleData() {
  try {
    console.log('Adding sample certificates to PostgreSQL...');
    
    // Initialize the certificates table
    await initializeTable();
    
    // Add sample certificates
    for (const certificate of sampleCertificates) {
      const result = await addCertificate(certificate);
      console.log(`Added certificate with ID: ${result.id}`);
    }
    
    console.log('Sample data added successfully!');
    console.log('\nTest university codes:');
    console.log('- PRP24CS068 (Goutham Sankar)');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Run the script
addSampleData(); 