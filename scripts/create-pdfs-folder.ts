import * as fs from 'fs';
import * as path from 'path';

const pdfsDirectory = path.join(process.cwd(), 'pdfs');

// Create pdfs directory if it doesn't exist
if (!fs.existsSync(pdfsDirectory)) {
  fs.mkdirSync(pdfsDirectory);
  console.log('✅ Created pdfs directory');
} else {
  console.log('📁 pdfs directory already exists');
}

console.log(`
📋 PDF Upload Setup Complete!

Next steps:
1. Place your PDF certificate files in the 'pdfs' folder
2. Name them according to university codes:
   - PRP24CS068.pdf
   - PRP24CS069.pdf
   - PRP24CS070.pdf
   - etc.

3. Run the bulk upload script:
   npx tsx scripts/bulk-upload-pdfs.ts

The script will automatically:
- Upload PDFs to Firebase Storage
- Add certificate data to Firestore
- Generate download URLs
- Make certificates available for download

📁 Your PDFs folder is ready at: ${pdfsDirectory}
`); 