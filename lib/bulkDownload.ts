import JSZip from 'jszip'
import { CertificateData } from './certificateService'
import { CertificateService } from './certificateService'

export class BulkDownloadService {
  /**
   * Download all certificates for a student as a ZIP file
   */
  static async downloadAllCertificates(certificates: CertificateData[], studentName: string): Promise<void> {
    try {
      const zip = new JSZip()
      
      // Create a folder for the student
      const studentFolder = zip.folder(studentName.replace(/\s+/g, '_'))
      
      if (!studentFolder) {
        throw new Error('Failed to create ZIP folder')
      }
      
      // Download and add each certificate to the ZIP
      const downloadPromises = certificates.map(async (certificate, index) => {
        try {
          let fileBlob: Blob
          let filename: string
          
          // Check if certificate has a stored download URL
          if (certificate.download_storage_url) {
            // Use the stored Firebase Storage URL
            const response = await fetch(certificate.download_storage_url)
            
            if (!response.ok) {
              throw new Error(`Failed to fetch certificate: ${response.statusText}`)
            }
            
            fileBlob = await response.blob()
            filename = certificate.download_file_name || `${certificate.certificateId}_${certificate.eventName.replace(/\s+/g, '_')}.png`
            
          } else {
            // Fallback to generating a simple certificate
            console.warn(`No stored download URL for certificate: ${certificate.certificateId}, generating simple certificate`)
            
            // For now, we'll skip certificates without stored URLs in bulk download
            // to avoid generating them dynamically which could be slow
            console.log(`Skipping certificate ${certificate.certificateId} - no stored URL available`)
            return null
          }
          
          // Add to ZIP
          studentFolder.file(filename, fileBlob)
          
          console.log(`✅ Added to ZIP: ${filename}`)
          return filename
          
        } catch (error) {
          console.error(`❌ Failed to add certificate ${certificate.certificateId}:`, error)
          return null
        }
      })
      
      // Wait for all downloads to complete
      const results = await Promise.all(downloadPromises)
      const successfulDownloads = results.filter(Boolean)
      
      if (successfulDownloads.length === 0) {
        throw new Error('No certificates could be downloaded. Please ensure certificates have been generated and uploaded to Firebase Storage.')
      }
      
      // Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${studentName}_All_Certificates.zip`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log(`🎉 Bulk download completed: ${successfulDownloads.length} certificates`)
      
    } catch (error) {
      console.error('❌ Bulk download failed:', error)
      throw new Error('Failed to download certificates')
    }
  }
  
  /**
   * Get download progress for bulk download
   */
  static async getDownloadProgress(certificates: CertificateData[]): Promise<number> {
    // This would track progress in a real implementation
    return 0
  }
} 