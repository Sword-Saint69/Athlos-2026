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
  position?: string;
  category?: string;
}

export class LocalCertificateService {
  // Local certificate data - you can add your certificates here
  private static readonly CERTIFICATES: CertificateData[] = [
    {
      id: '1',
      name: 'Goutham Sankar',
      eventName: 'DEXTRA Annual Arts Fest 2025',
      certificateId: 'DEXTRA25-068-DEXTRA-Annual-Arts-Fest-2025',
      universityCode: 'PRP24CS068',
      department: 'Computer Science',
      year: '2024',
      position: '1st Place',
      category: "Men's",
      pdfUrl: '/certificates/PRP24CS068-DEXTRA-Annual-Arts-Fest-2025.pdf'
    },
    {
      id: '2',
      name: 'Goutham Sankar',
      eventName: 'DEXTRA Music Concert 2025',
      certificateId: 'DEXTRA25-068-DEXTRA-Music-Concert-2025',
      universityCode: 'PRP24CS068',
      department: 'Computer Science',
      year: '2024',
      position: 'Runner Up',
      category: "Men's",
      pdfUrl: '/certificates/PRP24CS068-DEXTRA-Music-Concert-2025.pdf'
    },
    {
      id: '3',
      name: 'John Smith',
      eventName: 'DEXTRA Art Exhibition 2025',
      certificateId: 'DEXTRA25-069-DEXTRA-Art-Exhibition-2025',
      universityCode: 'PRP24CS069',
      department: 'Computer Science',
      year: '2024',
      position: '1st Place',
      category: "Men's",
      pdfUrl: '/certificates/PRP24CS069-DEXTRA-Art-Exhibition-2025.pdf'
    },
    {
      id: '4',
      name: 'Alice Johnson',
      eventName: 'DEXTRA Poetry Reading 2025',
      certificateId: 'DEXTRA25-070-DEXTRA-Poetry-Reading-2025',
      universityCode: 'PRP24CS070',
      department: 'Electrical Engineering',
      year: '2024',
      position: '1st Place',
      category: "Women's",
      pdfUrl: '/certificates/PRP24CS070-DEXTRA-Poetry-Reading-2025.pdf'
    }
  ];

  /**
   * Get all certificates by university code
   */
  static async getCertificatesByUniversityCode(universityCode: string): Promise<CertificateData[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.CERTIFICATES.filter(
      cert => cert.universityCode === universityCode
    );
  }

  /**
   * Get certificate by ID
   */
  static async getCertificateById(id: string): Promise<CertificateData | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.CERTIFICATES.find(cert => cert.id === id) || null;
  }

  /**
   * Get all certificates
   */
  static async getAllCertificates(): Promise<CertificateData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [...this.CERTIFICATES];
  }

  /**
   * Get PDF download URL for a certificate
   */
  static async getCertificatePdfUrl(certificateId: string): Promise<string | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const certificate = this.CERTIFICATES.find(cert => cert.certificateId === certificateId);
    return certificate?.pdfUrl || null;
  }

  /**
   * Download certificate PDF
   */
  static async downloadCertificatePdf(certificateId: string, fileName: string): Promise<void> {
    try {
      const url = await this.getCertificatePdfUrl(certificateId);
      if (!url) {
        throw new Error('PDF not found');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  }

  /**
   * Add a new certificate (for admin use)
   */
  static addCertificate(certificate: Omit<CertificateData, 'id'>): void {
    const newId = (this.CERTIFICATES.length + 1).toString();
    this.CERTIFICATES.push({
      ...certificate,
      id: newId
    });
  }

  /**
   * Get all university codes
   */
  static getAllUniversityCodes(): string[] {
    return [...new Set(this.CERTIFICATES.map(cert => cert.universityCode))];
  }
} 