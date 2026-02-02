import { NextRequest, NextResponse } from 'next/server';
import { addCertificate } from '@/lib/certificateServicePostgres';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Adding test certificate:', body);
    
    // Validate required fields
    if (!body.search_id || !body.event_name || !body.organizer_name) {
      return NextResponse.json(
        { error: 'Missing required fields: search_id, event_name, organizer_name' },
        { status: 400 }
      );
    }
    
    // Add the certificate to PostgreSQL
    const result = await addCertificate({
      ...body,
      created_at: new Date().toISOString(),
      test_data: true
    });
    
    console.log('Test certificate added with ID:', result.id);
    
    return NextResponse.json({ 
      id: result.id,
      message: 'Test certificate added successfully',
      data: body
    });
    
  } catch (error) {
    console.error('Error adding test certificate:', error);
    return NextResponse.json(
      { error: 'Failed to add test certificate' },
      { status: 500 }
    );
  }
} 