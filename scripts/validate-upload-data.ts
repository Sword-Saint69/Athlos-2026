import * as fs from 'fs';
import * as path from 'path';

interface CertificateInfo {
  universityCode: string;
  name: string;
  eventName: string;
  department: string;
  year: string;
  position?: string;
  category?: string;
}

// Import your certificate data (same as in bulk-upload-pdfs.ts)
const certificateData: CertificateInfo[] = [
  // Copy your certificate data here
  {
    universityCode: "PRP24CS068",
    name: "Goutham Sankar",
    eventName: "DEXTRA Annual Arts Fest 2025",
    department: "Computer Science",
    year: "2024",
    position: "1st Place",
    category: "Men's"
  },
  // Add all your certificates here...
];

function generateEventSlug(eventName: string): string {
  return eventName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
}

function generatePdfFileName(universityCode: string, eventName: string): string {
  const eventSlug = generateEventSlug(eventName);
  return `${universityCode}-${eventSlug}.pdf`;
}

function validateCertificateData() {
  console.log('🔍 Validating Certificate Data...\n');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required fields
  certificateData.forEach((cert, index) => {
    if (!cert.universityCode) {
      errors.push(`Certificate ${index + 1}: Missing universityCode`);
    }
    if (!cert.name) {
      errors.push(`Certificate ${index + 1}: Missing name`);
    }
    if (!cert.eventName) {
      errors.push(`Certificate ${index + 1}: Missing eventName`);
    }
    if (!cert.department) {
      errors.push(`Certificate ${index + 1}: Missing department`);
    }
    if (!cert.year) {
      errors.push(`Certificate ${index + 1}: Missing year`);
    }
    
    // Check for duplicate certificates
    const duplicate = certificateData.find((other, otherIndex) => 
      otherIndex !== index && 
      other.universityCode === cert.universityCode && 
      other.eventName === cert.eventName
    );
    
    if (duplicate) {
      errors.push(`Certificate ${index + 1}: Duplicate certificate for ${cert.universityCode} - ${cert.eventName}`);
    }
  });
  
  if (errors.length > 0) {
    console.log('❌ Data Validation Errors:');
    errors.forEach(error => console.log(`   ${error}`));
  } else {
    console.log('✅ Certificate data validation passed');
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  return errors.length === 0;
}

function validatePdfFiles(pdfsDirectory: string) {
  console.log('\n📁 Validating PDF Files...\n');
  
  const missingFiles: string[] = [];
  const existingFiles: string[] = [];
  
  certificateData.forEach((cert, index) => {
    const pdfFileName = generatePdfFileName(cert.universityCode, cert.eventName);
    const pdfPath = path.join(pdfsDirectory, pdfFileName);
    
    if (fs.existsSync(pdfPath)) {
      existingFiles.push(pdfFileName);
      console.log(`✅ Found: ${pdfFileName}`);
    } else {
      missingFiles.push(pdfFileName);
      console.log(`❌ Missing: ${pdfFileName}`);
    }
  });
  
  console.log(`\n📊 PDF File Summary:`);
  console.log(`   ✅ Found: ${existingFiles.length}`);
  console.log(`   ❌ Missing: ${missingFiles.length}`);
  console.log(`   📁 Total expected: ${certificateData.length}`);
  
  if (missingFiles.length > 0) {
    console.log('\n📋 Missing PDF Files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
  }
  
  return missingFiles.length === 0;
}

function generateExpectedFileList() {
  console.log('\n📋 Expected PDF File Names:');
  certificateData.forEach((cert, index) => {
    const pdfFileName = generatePdfFileName(cert.universityCode, cert.eventName);
    console.log(`   ${index + 1}. ${pdfFileName} (${cert.name} - ${cert.eventName})`);
  });
}

function main() {
  console.log('🔍 DEXTRA Certificate Upload Validator\n');
  
  const pdfsDirectory = path.join(process.cwd(), 'pdfs');
  
  // Check if pdfs directory exists
  if (!fs.existsSync(pdfsDirectory)) {
    console.log('❌ PDFs directory not found. Creating...');
    fs.mkdirSync(pdfsDirectory, { recursive: true });
    console.log('✅ Created pdfs directory');
  }
  
  // Validate certificate data
  const dataValid = validateCertificateData();
  
  // Validate PDF files
  const filesValid = validatePdfFiles(pdfsDirectory);
  
  // Generate expected file list
  generateExpectedFileList();
  
  console.log('\n🎯 Validation Summary:');
  console.log(`   📊 Certificate Data: ${dataValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   📁 PDF Files: ${filesValid ? '✅ All Found' : '❌ Missing Files'}`);
  
  if (dataValid && filesValid) {
    console.log('\n🎉 Ready for upload! Run: npx tsx scripts/bulk-upload-pdfs.ts');
  } else {
    console.log('\n⚠️  Please fix the issues above before uploading.');
  }
}

// Run validation
main(); 