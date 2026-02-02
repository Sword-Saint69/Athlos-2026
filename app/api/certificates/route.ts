import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/certificateService';
import { rateLimiter } from '@/lib/rateLimiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = rateLimiter.checkLimit(clientIP)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const universityCode = searchParams.get('universityCode');
    const id = searchParams.get('id');

    console.log('API Debug: Request parameters:', { universityCode, id });

    if (!universityCode && !id) {
      console.log('API Debug: No university code or ID provided');
      return NextResponse.json(
        { error: 'University code or certificate ID is required' },
        { status: 400 }
      );
    }

    let certificates;

    if (universityCode) {
      // Search by university code (search_id), email (search_id1), or phone (search_id2)
      console.log(`API Debug: Searching for certificates with term: "${universityCode}"`);
      
      // Use the enhanced search method that checks all search fields
      certificates = await CertificateService.getCertificatesBySearchTerm(universityCode);
      
      console.log(`API Debug: Found ${certificates.length} certificates for term "${universityCode}"`);
      
    } else if (id) {
      // For certificate ID, we need to search in the collection
      console.log(`API Debug: Searching for certificate with ID: "${id}"`);
      
      const certificate = await CertificateService.getCertificateById(id);
      certificates = certificate ? [certificate] : [];
      
      console.log(`API Debug: Found certificate with ID "${id}":`, certificate !== null);
    }

    if (!certificates || certificates.length === 0) {
      console.log('API Debug: No certificates found, returning 404');
      return NextResponse.json(
        { error: 'No certificates found for this university code.' },
        { status: 404 }
      );
    }

    // Log the certificates found for debugging
    console.log(`Found ${certificates.length} certificates for ${universityCode || id}:`);
    certificates.forEach((cert: any, index: number) => {
      console.log(`${index + 1}. ${cert.name} - ${cert.universityCode}`);
      console.log(`   Has download URL: ${!!cert.download_storage_url}`);
      console.log(`   File name: ${cert.download_file_name || 'N/A'}`);
      console.log(`   File size: ${cert.download_file_size || 'N/A'} bytes`);
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { universityCode } = body;

    if (!universityCode) {
      return NextResponse.json(
        { error: 'University code is required' },
        { status: 400 }
      );
    }

    const certificates = await CertificateService.getCertificatesBySearchTerm(universityCode);

    if (!certificates || certificates.length === 0) {
      return NextResponse.json(
        { error: 'No certificates found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 