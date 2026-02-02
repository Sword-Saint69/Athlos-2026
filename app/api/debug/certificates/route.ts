import { NextRequest, NextResponse } from 'next/server';
import { getAllCertificates } from '@/lib/certificateServicePostgres';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching all certificates from database...');
    
    // Get all certificates from the database
    const certificates = await getAllCertificates();
    
    const formattedCertificates = certificates.map(cert => ({
      id: cert.id,
      search_id: cert.search_id || cert.universityCode || 'N/A',
      event_name: cert.event_name || cert.eventName || cert.name || 'N/A',
      organizer_name: cert.organizer_name || cert.organizerName || 'N/A',
      certificate_id: cert.certificate_id || cert.certificateId || 'N/A',
      download_storage_url: cert.download_storage_url || null,
      download_file_name: cert.download_file_name || 'N/A',
      download_file_size: cert.download_file_size || 'N/A',
      has_download_url: !!(cert.download_storage_url),
      // Include all other fields for debugging
      ...cert
    }));
    
    console.log(`Debug: Found ${formattedCertificates.length} certificates in database`);
    
    // Log some sample certificates for debugging
    if (formattedCertificates.length > 0) {
      console.log('Debug: Sample certificates:');
      formattedCertificates.slice(0, 3).forEach((cert, index) => {
        console.log(`${index + 1}. ID: ${cert.id}, Search ID: ${cert.search_id}, Event: ${cert.event_name}`);
      });
    }
    
    return NextResponse.json({ 
      certificates: formattedCertificates,
      total: formattedCertificates.length,
      message: `Found ${formattedCertificates.length} certificates in database`
    });
    
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch certificates from database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 