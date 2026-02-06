import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc, getDocs, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
        }

        // Fetch all events to map event names/IDs to Firestore event IDs
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventsMap = new Map();
        eventsSnapshot.forEach((doc) => {
            const eventData = doc.data();
            const eventInfo = {
                id: doc.id,
                name: eventData.name,
                category: eventData.category,
                eventId: eventData.eventId
            };

            // Store by name (lowercase) for easier matching
            if (eventData.name) {
                eventsMap.set(eventData.name.toLowerCase().trim(), eventInfo);
            }
            // Also store by eventId if available
            if (eventData.eventId) {
                eventsMap.set(eventData.eventId.toLowerCase().trim(), eventInfo);
            }
            // Also store by doc ID
            eventsMap.set(doc.id.toLowerCase().trim(), eventInfo);
        });

        const batch = writeBatch(db);
        const athletesCollection = collection(db, 'athletes');

        data.forEach((row: any) => {
            const newAthleteRef = doc(athletesCollection);

            // Get event info from the "Event" column in the Excel
            const excelEvent = String(row.event || row['Event'] || '').toLowerCase().trim();
            const matchedEvent = eventsMap.get(excelEvent);

            // Map Excel columns to Firestore athlete schema provided by user
            const athleteData = {
                email: row.email || row['Email'] || '',
                event: matchedEvent ? matchedEvent.id : excelEvent, // Fallback to raw string if no match
                eventCategory: matchedEvent ? matchedEvent.category : (row.eventCategory || row['Event Category'] || ''),
                eventId: matchedEvent ? matchedEvent.eventId : (row.eventId || row['Event ID'] || ''),
                eventName: matchedEvent ? matchedEvent.name : (row.eventName || row['Event Name'] || ''),
                fullName: row.fullName || row['Full Name'] || '',
                group: row.group || row['Group'] || 'AGNI',
                phoneNumber: String(row.phoneNumber || row['Phone Number'] || ''),
                registeredAt: Timestamp.now(), // Use Firestore Timestamp
                sex: String(row.sex || row['Sex'] || '').toLowerCase(),
                status: 'pending', // Initial status is "pending" as per user request
                universityCode: row.universityCode || row['University Code'] || '',
            };

            batch.set(newAthleteRef, athleteData);
        });

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `${data.length} athletes uploaded successfully`,
            count: data.length
        });

    } catch (error: any) {
        console.error('Error uploading athletes:', error);
        return NextResponse.json({ error: 'Failed to upload athletes: ' + error.message }, { status: 500 });
    }
}
