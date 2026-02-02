import { NextRequest, NextResponse } from 'next/server';
import { addCertificates } from '@/lib/certificateServicePostgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificates } = body;
    
    console.log('Adding multiple test certificates:', certificates);
    
    if (!certificates || !Array.isArray(certificates)) {
      return NextResponse.json(
        { error: 'Certificates array is required' },
        { status: 400 }
      );
    }
    
    // Validate each certificate
    for (const cert of certificates) {
      if (!cert.search_id || !cert.event_name || !cert.organizer_name) {
        return NextResponse.json(
          { error: 'Each certificate must have search_id, event_name, and organizer_name' },
          { status: 400 }
        );
      }
    }
    
    // Add all certificates to PostgreSQL
    const addedCertificates = await addCertificates(certificates);
    
    console.log(`Added ${addedCertificates.length} test certificates`);
    
    return NextResponse.json({ 
      count: addedCertificates.length,
      message: `Added ${addedCertificates.length} test certificates successfully`,
      certificates: addedCertificates
    });
    
  } catch (error) {
    console.error('Error adding test certificates:', error);
    return NextResponse.json(
      { error: 'Failed to add test certificates' },
      { status: 500 }
    );
  }
} 