import { storage, db } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

interface CertificateInfo {
  universityCode: string;
  name: string;
  eventName: string;
  department: string;
  year: string;
  position?: string; // Optional: 1st, 2nd, 3rd place
  category?: string; // Optional: Men's, Women's, Mixed
}

// Certificate data mapping - UPDATE THIS WITH YOUR ACTUAL DATA
const certificateData: CertificateInfo[] = [
  // Example data - Replace with your actual certificate data
  {
    universityCode: "PRP24CS068",
    name: "Goutham Sankar",
    eventName: "DEXTRA Annual Arts Fest 2025",
    department: "Computer Science",
    year: "2024",
    position: "1st Place",
    category: "Men's"
  },
  {
    universityCode: "PRP24CS068",
    name: "Goutham Sankar",
    eventName: "DEXTRA Music Concert 2025",
    department: "Computer Science",
    year: "2024",
    position: "Runner Up",
    category: "Men's"
  },
  {
    universityCode: "PRP24CS068",
    name: "Goutham Sankar",
    eventName: "DEXTRA Dance Performance 2025",
    department: "Computer Science",
    year: "2024",
    position: "3rd Place",
    category: "Men's"
  },
  {
    universityCode: "PRP24CS069",
    name: "John Smith",
    eventName: "DEXTRA Art Exhibition 2025",
    department: "Computer Science",
    year: "2024",
    position: "1st Place",
    category: "Men's"
  },
  {
    universityCode: "PRP24CS069",
    name: "John Smith",
    eventName: "DEXTRA Drama Show 2025",
    department: "Computer Science",
    year: "2024",
    position: "2nd Place",
    category: "Men's"
  },
  {
    universityCode: "PRP24CS070",
    name: "Alice Johnson",
    eventName: "DEXTRA Poetry Reading 2025",
    department: "Electrical Engineering",
    year: "2024",
    position: "1st Place",
    category: "Women's"
  }
];

async function uploadPdfToStorage(pdfPath: string, certificateId: string): Promise<string> {
  try {
    const fileBuffer = fs.readFileSync(pdfPath);
    const storageRef = ref(storage, `certificates/${certificateId}.pdf`);
    
    await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log(`✅ Uploaded: ${certificateId}.pdf`);
    return downloadURL;
  } catch (error) {
    console.error(`❌ Failed to upload ${certificateId}.pdf:`, error);
    throw error;
  }
}

async function addCertificateToFirestore(certificateInfo: CertificateInfo, pdfUrl: string) {
  try {
    // Generate unique certificate ID based on event name
    const eventSlug = certificateInfo.eventName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    const certificateId = `DEXTRA25-${certificateInfo.universityCode.slice(-3)}-${eventSlug}`;
    
    const certificateData = {
      name: certificateInfo.name,
      eventName: certificateInfo.eventName,
      certificateId: certificateId,
      universityCode: certificateInfo.universityCode,
      department: certificateInfo.department,
      year: certificateInfo.year,
      pdfUrl: pdfUrl,
      position: certificateInfo.position || null,
      category: certificateInfo.category || null,
      uploadedAt: new Date().toISOString(),
      status: 'active'
    };

    const docRef = await addDoc(collection(db, 'certificates'), certificateData);
    console.log(`✅ Added to Firestore: ${certificateInfo.name} - ${certificateInfo.eventName} (${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error(`❌ Failed to add to Firestore: ${certificateInfo.name} - ${certificateInfo.eventName}`, error);
    throw error;
  }
}

async function bulkUploadCertificates(pdfsDirectory: string) {
  console.log('🚀 Starting bulk PDF upload...\n');
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < certificateData.length; i++) {
    const certificateInfo = certificateData[i];
    console.log(`📋 Processing ${i + 1}/${certificateData.length}: ${certificateInfo.name} - ${certificateInfo.eventName}`);
    
    try {
      // Generate PDF filename based on event name
      const eventSlug = certificateInfo.eventName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      const pdfFileName = `${certificateInfo.universityCode}-${eventSlug}.pdf`;
      const pdfPath = path.join(pdfsDirectory, pdfFileName);
      
      // Check if PDF file exists
      if (!fs.existsSync(pdfPath)) {
        console.log(`⚠️  PDF not found: ${pdfFileName} - Skipping...`);
        skippedCount++;
        continue;
      }

      // Upload PDF to Firebase Storage
      console.log(`📤 Uploading PDF: ${pdfFileName}`);
      const pdfUrl = await uploadPdfToStorage(pdfPath, certificateInfo.universityCode + '-' + eventSlug);
      
      // Add certificate data to Firestore
      console.log(`💾 Adding to database...`);
      await addCertificateToFirestore(certificateInfo, pdfUrl);
      
      console.log(`✅ Completed: ${certificateInfo.name} - ${certificateInfo.eventName}\n`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed to process ${certificateInfo.name} - ${certificateInfo.eventName}:`, error);
      errorCount++;
    }
  }
  
  console.log('🎉 Bulk upload completed!');
  console.log(`📊 Summary:`);
  console.log(`   ✅ Successfully uploaded: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⚠️  Skipped (missing PDFs): ${skippedCount}`);
  console.log(`   📁 Total processed: ${certificateData.length}`);
}

// Usage instructions
console.log(`
📁 PDF Upload Instructions:

1. Create a folder called 'pdfs' in your project root
2. Place your PDF files in the folder with these names:
   - PRP24CS068-DEXTRA-Annual-Arts-Fest-2025.pdf (Goutham Sankar - Annual Arts Fest)
   - PRP24CS068-DEXTRA-Music-Concert-2025.pdf (Goutham Sankar - Music Concert)
   - PRP24CS068-DEXTRA-Dance-Performance-2025.pdf (Goutham Sankar - Dance Performance)
   - PRP24CS069-DEXTRA-Art-Exhibition-2025.pdf (John Smith - Art Exhibition)
   - PRP24CS069-DEXTRA-Drama-Show-2025.pdf (John Smith - Drama Show)
   - PRP24CS070-DEXTRA-Poetry-Reading-2025.pdf (Alice Johnson - Poetry Reading)

3. Run this script: npx tsx scripts/bulk-upload-pdfs.ts

The script will:
- Upload PDFs to Firebase Storage
- Add certificate data to Firestore
- Generate download URLs
- Link everything together
- Support multiple certificates per student
`);

// Run the bulk upload
const pdfsDirectory = path.join(process.cwd(), 'pdfs');
bulkUploadCertificates(pdfsDirectory); 