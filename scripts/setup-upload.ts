import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 DEXTRA Certificate Upload Setup\n');

// Create necessary directories
const directories = ['pdfs', 'scripts'];

directories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory exists: ${dir}`);
  }
});

// Create sample certificate data template
const sampleData = `// Sample certificate data - Replace with your actual data
const certificateData: CertificateInfo[] = [
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
  // Add more certificates here...
];`;

console.log('\n📋 Next Steps:');
console.log('1. 📝 Update certificate data in scripts/bulk-upload-pdfs.ts');
console.log('2. 📁 Place PDF files in the pdfs/ directory');
console.log('3. 🔍 Run validation: npx tsx scripts/validate-upload-data.ts');
console.log('4. 🚀 Run upload: npx tsx scripts/bulk-upload-pdfs.ts');

console.log('\n📖 Sample Certificate Data:');
console.log(sampleData);

console.log('\n📁 Expected PDF File Names:');
console.log('- PRP24CS068-DEXTRA-Annual-Arts-Fest-2025.pdf');
console.log('- PRP24CS068-DEXTRA-Music-Concert-2025.pdf');
console.log('- PRP24CS069-DEXTRA-Music-Concert-2025.pdf');

console.log('\n🎯 Ready to start uploading!'); 