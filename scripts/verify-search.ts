import { CertificateService } from '../lib/certificateService';

async function verifySearch() {
    const universityCodes = ["PRP24CS087", "7012881003"];

    console.log('🚀 Verifying CertificateService search logic update...');

    for (const code of universityCodes) {
        console.log(`\n🔍 Searching for code: "${code}"`);
        try {
            const certificates = await CertificateService.getCertificatesBySearchTerm(code);

            if (certificates && certificates.length > 0) {
                console.log(`✅ Found ${certificates.length} certificates for "${code}"`);
                certificates.forEach((cert, index) => {
                    console.log(`${index + 1}. ${cert.name} - ${cert.eventName}`);
                });
            } else {
                console.log(`❌ No certificates found for "${code}"`);
            }
        } catch (error) {
            console.error(`❌ Search failed for "${code}":`, error);
        }
    }
}

verifySearch().catch(console.error);
