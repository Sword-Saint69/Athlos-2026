import { db1, db2, storage } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc, DocumentData, Firestore } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

export interface CertificateData {
  id: string;
  name: string;
  eventName: string;
  certificateId: string;
  universityCode: string;
  phone?: string;
  department?: string;
  year?: string;
  pdfUrl?: string;
  organizerName?: string;
  search_id?: string;
  search_id1?: string;
  search_id2?: string;
  certificate_id?: string;
  event_name?: string;
  event?: string;
  organizer_name?: string;
  certificate_base64?: string;
  created_at?: any;
  font_family?: string;
  font_size?: string;
  semester?: string;
  // Download link fields from Firebase database
  download_storage_url?: string;
  download_storage_path?: string;
  download_file_name?: string;
  download_file_size?: number;
  download_file_format?: string;
  download_generated_at?: any;
  download_count?: number;
  download_links?: {
    direct_url?: string;
    search_url?: string;
    token_url?: string;
    api_url?: string;
    generated_at?: any;
    unique_token?: string;
  };
  certificate_metadata?: {
    event_name?: string;
    organizer_name?: string;
    search_id?: string;
    template_id?: string;
    generated_timestamp?: number;
    bulk_upload?: boolean;
  };
  [key: string]: any; // Allow for additional dynamic fields
}

export class CertificateService {
  private static readonly COLLECTION_1 = 'certificates-final';
  private static readonly COLLECTION_2 = 'certificates';

  static async getCertificatesFromDb(db: Firestore, collectionName: string, searchTerm: string, fieldName: string): Promise<CertificateData[]> {
    try {
      const certificatesRef = collection(db, collectionName);
      const q = query(certificatesRef, where(fieldName, '==', searchTerm));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data["Full Name"] || data.name || data.event_name || 'Unknown',
          eventName: data["Event"] || data.eventName || data.event || data.event_name || 'Unknown Event',
          certificateId: data["University Code"] || data.certificate_id || data.certificateId || 'Unknown',
          universityCode: data["University Code"] || data.universityCode || data.search_id || data.search_id1 || searchTerm,
          phone: data["Phone Number"] || data.phone,
          email: data["Email"] || data.email || data.search_id1,
          sex: data["Sex"],
          group: data["Group"],
          certificate_base64: data.certificate_base64,
          created_at: data.created_at,
          ...data
        };
      }) as CertificateData[];
    } catch (error) {
      console.error(`Error fetching from ${collectionName} by ${fieldName}:`, error);
      return [];
    }
  }

  static async getCertificatesBySearchTerm(searchTerm: string): Promise<CertificateData[]> {
    try {
      // Create tasks for all possible searches in both databases
      const tasks = [
        // DB 1 (Legacy)
        this.getCertificatesFromDb(db1, this.COLLECTION_1, searchTerm, 'search_id'),
        this.getCertificatesFromDb(db1, this.COLLECTION_1, searchTerm, 'search_id1'),
        this.getCertificatesFromDb(db1, this.COLLECTION_1, searchTerm, 'search_id2'),

        // DB 2 (New)
        this.getCertificatesFromDb(db2, this.COLLECTION_2, searchTerm, 'University Code'),
        this.getCertificatesFromDb(db2, this.COLLECTION_2, searchTerm, 'Email'),
        this.getCertificatesFromDb(db2, this.COLLECTION_2, searchTerm, 'Phone Number'),
        this.getCertificatesFromDb(db2, this.COLLECTION_2, searchTerm, 'SEARCH ID 1'),
        this.getCertificatesFromDb(db2, this.COLLECTION_2, searchTerm, 'SEARCH ID 2'),
      ];

      const allResults = await Promise.all(tasks);

      // Flatten and remove duplicates (by ID)
      const flattened = allResults.flat();
      const uniqueResults = Array.from(new Map(flattened.map(item => [item.id, item])).values());

      return uniqueResults;
    } catch (error) {
      console.error('Error in multi-db search:', error);
      throw new Error('Failed to fetch certificates from databases');
    }
  }

  static async getCertificatesByUniversityCode(searchId: string): Promise<CertificateData[]> {
    return this.getCertificatesBySearchTerm(searchId);
  }

  static async getCertificatesBySearchId1(searchId1: string): Promise<CertificateData[]> {
    return this.getCertificatesBySearchTerm(searchId1);
  }

  static async getCertificatesBySearchId2(searchId2: string): Promise<CertificateData[]> {
    return this.getCertificatesBySearchTerm(searchId2);
  }

  /**
   * Get certificate by ID
   */
  static async getCertificateById(id: string): Promise<CertificateData | null> {
    try {
      // Try DB 1
      const docRef1 = doc(db1, this.COLLECTION_1, id);
      const docSnap1 = await getDoc(docRef1);

      if (docSnap1.exists()) {
        return { id: docSnap1.id, ...docSnap1.data() } as CertificateData;
      }

      // Try DB 2
      const docRef2 = doc(db2, this.COLLECTION_2, id);
      const docSnap2 = await getDoc(docRef2);

      if (docSnap2.exists()) {
        return { id: docSnap2.id, ...docSnap2.data() } as CertificateData;
      }

      return null;
    } catch (error) {
      console.error('Error fetching certificate by ID:', error);
      throw new Error('Failed to fetch certificate');
    }
  }

  /**
   * Get all certificates (for admin purposes)
   */
  static async getAllCertificates(): Promise<CertificateData[]> {
    try {
      const tasks = [
        getDocs(collection(db1, this.COLLECTION_1)),
        getDocs(collection(db2, this.COLLECTION_2))
      ];

      const snapshots = await Promise.all(tasks);

      const allDocs = snapshots.flatMap((snap, index) => snap.docs.map(doc => ({
        id: doc.id,
        isFromDb1: index === 0,
        ...doc.data()
      })));

      return allDocs as unknown as CertificateData[];
    } catch (error) {
      console.error('Error fetching all certificates:', error);
      throw new Error('Failed to fetch certificates');
    }
  }

  /**
   * Add a new certificate to DB2 (Certificate Provider)
   */
  static async addCertificate(data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db2, this.COLLECTION_2), {
        ...data,
        created_at: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding certificate:', error);
      throw new Error('Failed to add certificate');
    }
  }

  /**
   * Delete all certificates associated with an athlete across both databases
   */
  static async deleteCertificatesByAthlete(identifiers: { universityCode?: string; email?: string; phone?: string }): Promise<number> {
    try {
      // Find all certificates that match any of the identifiers
      const searchTerms = [identifiers.universityCode, identifiers.email, identifiers.phone].filter(Boolean) as string[];

      if (searchTerms.length === 0) return 0;

      // Use the existing search logic to find certificates
      // This is safer than raw queries because it handles the different field names (search_id, University Code, etc.)
      const certificatesToDelete = await Promise.all(
        searchTerms.map(term => this.getCertificatesBySearchTerm(term))
      );

      const uniqueCertificates = Array.from(
        new Map(certificatesToDelete.flat().map(c => [c.id, c])).values()
      );

      if (uniqueCertificates.length === 0) return 0;

      // Delete each certificate
      await Promise.all(
        uniqueCertificates.map(cert => this.deleteCertificate(cert.id, !!cert.isFromDb1))
      );

      return uniqueCertificates.length;
    } catch (error) {
      console.error('Error in bulk certificate deletion:', error);
      throw new Error('Failed to delete associated certificates');
    }
  }

  /**
   * Delete a certificate from either database
   */
  static async deleteCertificate(id: string, fromDb1: boolean = false): Promise<void> {
    try {
      const db = fromDb1 ? db1 : db2;
      const collectionName = fromDb1 ? this.COLLECTION_1 : this.COLLECTION_2;
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw new Error('Failed to delete certificate');
    }
  }

  /**
   * Download certificate using stored Firebase Storage URL or base64 data
   */
  static async downloadCertificate(certificate: CertificateData): Promise<void> {
    try {
      // Check if we have a stored download URL
      if (certificate.download_storage_url) {
        // Use the stored Firebase Storage URL
        await this.downloadFromStorageUrl(certificate.download_storage_url, certificate.download_file_name || `${certificate.name}_${certificate.eventName}.png`);
      } else if (certificate.certificate_base64) {
        // Use the base64 encoded certificate data if available
        console.log('Using base64 certificate data for download');
        await this.downloadFromBase64(certificate.certificate_base64, certificate.download_file_name || `${certificate.name}_${certificate.eventName}.png`, certificate.download_file_format || 'image/png');
      } else {
        // Fallback to generating a simple certificate if no stored URL or base64 data
        console.warn('No stored download URL or base64 data found, generating simple certificate');
        await this.generateSimpleCertificateFromData(certificate, `${certificate.name}_${certificate.eventName}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw new Error('Failed to download certificate');
    }
  }

  /**
   * Download certificate from base64 encoded data
   */
  static async downloadFromBase64(base64Data: string, fileName: string, mimeType: string = 'image/png'): Promise<void> {
    try {
      // Remove data URL prefix if present and extract mime type
      let cleanBase64 = base64Data;
      let finalMimeType = mimeType;

      if (base64Data.startsWith('data:')) {
        // Extract mime type from data URL
        const dataUrlParts = base64Data.split(',');
        const header = dataUrlParts[0];

        // Extract mime type from header
        const mimeTypeMatch = header.match(/data:(.*?);base64/);
        if (mimeTypeMatch) {
          finalMimeType = mimeTypeMatch[1];
        }

        cleanBase64 = dataUrlParts[1];
      }

      // Convert base64 to binary data
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob from binary data
      const blob = new Blob([bytes], { type: finalMimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Certificate downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error('Error downloading from base64:', error);
      throw new Error('Failed to download certificate from base64 data');
    }
  }

  /**
   * Download certificate from Firebase Storage URL
   */
  static async downloadFromStorageUrl(storageUrl: string, fileName: string): Promise<void> {
    try {
      // Fetch the file from Firebase Storage
      const response = await fetch(storageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch certificate: ${response.statusText}`);
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Certificate downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error('Error downloading from storage URL:', error);
      throw new Error('Failed to download certificate from storage');
    }
  }

  /**
   * Get PDF download URL for a certificate (legacy method)
   */
  static async getCertificatePdfUrl(certificateId: string): Promise<string | null> {
    try {
      // Skip Firebase Storage for now due to CORS issues
      // We'll generate certificates dynamically instead
      return null;
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      return null;
    }
  }

  /**
   * Download certificate PDF (legacy method - now uses downloadCertificate)
   */
  static async downloadCertificatePdf(certificateId: string, fileName: string): Promise<void> {
    try {
      // Get certificate data first
      const certificate = await this.getCertificateById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // Use the new download method
      await this.downloadCertificate(certificate);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  /**
   * Download certificate PDF by ID (uses certificate data directly)
   */
  static async downloadCertificateById(certificateId: string, fileName: string): Promise<void> {
    try {
      // Get certificate data first
      const certificate = await this.getCertificateById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // Use the new download method
      await this.downloadCertificate(certificate);
    } catch (error) {
      console.error('Error downloading certificate by ID:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  /**
   * Generate a simple certificate HTML file
   */
  static async generateSimpleCertificate(certificateId: string, fileName: string): Promise<void> {
    try {
      let certificate;

      // First try to get certificate by ID
      const response = await fetch(`/api/certificates?id=${certificateId}`);
      const data = await response.json();

      if (data.certificates && data.certificates.length > 0) {
        certificate = data.certificates[0];
      } else {
        // If not found by ID, try searching by university code
        const searchResponse = await fetch(`/api/certificates?universityCode=${certificateId}`);
        const searchData = await searchResponse.json();

        if (!searchData.certificates || searchData.certificates.length === 0) {
          throw new Error('Certificate not found');
        }

        // Use the first certificate found
        certificate = searchData.certificates[0];
      }

      // Create a simple HTML certificate
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Certificate - ${certificate.name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 800px;
              width: 100%;
              border: 3px solid #667eea;
            }
            .title {
              font-size: 2.5em;
              color: #333;
              margin-bottom: 20px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .subtitle {
              font-size: 1.2em;
              color: #666;
              margin-bottom: 30px;
            }
            .name {
              font-size: 2.2em;
              color: #667eea;
              margin: 30px 0;
              font-weight: bold;
              text-transform: uppercase;
            }
            .event {
              font-size: 1.5em;
              color: #333;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .details {
              font-size: 1.1em;
              color: #666;
              margin: 20px 0;
              line-height: 1.6;
            }
            .footer {
              margin-top: 40px;
              font-size: 0.9em;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .certificate-id {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
              font-family: monospace;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">Certificate of Participation</div>
            <div class="subtitle">This is to certify that</div>
            <div class="name">${certificate.name}</div>
            <div class="event">has successfully participated in</div>
            <div class="event">${certificate.eventName}</div>
            <div class="details">
              <div class="certificate-id">
                <strong>Certificate ID:</strong> ${certificate.certificateId}
              </div>
              <div class="certificate-id">
                <strong>University Code:</strong> ${certificate.universityCode}
              </div>
              ${certificate.organizerName ? `
                <div class="certificate-id">
                  <strong>Organizer:</strong> ${certificate.organizerName}
                </div>
              ` : ''}
              ${certificate.department ? `
                <div class="certificate-id">
                  <strong>Department:</strong> ${certificate.department}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>
              <p>DEXTRA 2025 - College of Engineering and Management Punnapra</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create and download the HTML file
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.pdf', '.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  /**
   * Generate a simple certificate from the certificate data object
   */
  static async generateSimpleCertificateFromData(certificate: CertificateData, fileName: string): Promise<void> {
    try {
      // Create a simple HTML certificate using the provided data
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Certificate - ${certificate.name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 800px;
              width: 100%;
              border: 3px solid #667eea;
            }
            .title {
              font-size: 2.5em;
              color: #333;
              margin-bottom: 20px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .subtitle {
              font-size: 1.2em;
              color: #666;
              margin-bottom: 30px;
            }
            .name {
              font-size: 2.2em;
              color: #667eea;
              margin: 30px 0;
              font-weight: bold;
              text-transform: uppercase;
            }
            .event {
              font-size: 1.5em;
              color: #333;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .details {
              font-size: 1.1em;
              color: #666;
              margin: 20px 0;
              line-height: 1.6;
            }
            .footer {
              margin-top: 40px;
              font-size: 0.9em;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .certificate-id {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
              font-family: monospace;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">Certificate of Participation</div>
            <div class="subtitle">This is to certify that</div>
            <div class="name">${certificate.name}</div>
            <div class="event">has successfully participated in</div>
            <div class="event">${certificate.eventName}</div>
            <div class="details">
              <div class="certificate-id">
                <strong>Certificate ID:</strong> ${certificate.certificateId}
              </div>
              <div class="certificate-id">
                <strong>University Code:</strong> ${certificate.universityCode}
              </div>
              ${certificate.organizerName ? `
                <div class="certificate-id">
                  <strong>Organizer:</strong> ${certificate.organizerName}
                </div>
              ` : ''}
              ${certificate.department ? `
                <div class="certificate-id">
                  <strong>Department:</strong> ${certificate.department}
                </div>
              ` : ''}
              ${certificate.semester ? `
                <div class="certificate-id">
                  <strong>Semester:</strong> ${certificate.semester}
                </div>
              ` : ''}
              ${certificate.year ? `
                <div class="certificate-id">
                  <strong>Year:</strong> ${certificate.year}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</p>
              <p>DEXTRA 2025 - College of Engineering and Management Punnapra</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create and download the HTML file
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.pdf', '.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating certificate from data:', error);
      throw new Error('Failed to generate certificate from data');
    }
  }


} 