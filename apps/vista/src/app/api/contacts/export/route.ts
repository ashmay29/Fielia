import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Card from '@/models/Card';
import { getSession } from '@/lib/auth';

// Escape special vCard characters according to RFC 2426
function escapeVCardText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')  // Backslash must be escaped first
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');     // Remove carriage returns
}

// Sanitize phone number to prevent injection
function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Allow only digits, +, -, (, ), and spaces
  return phone.replace(/[^0-9+\-() ]/g, '');
}

export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Fetch cards with only required fields, excluding entries without phone
    const cards = await Card.find(
      { phone: { $exists: true, $ne: '' } },
      { firstName: 1, lastName: 1, phone: 1, _id: 0 }
    )
      .lean()
      .exec();

    // Generate vCard 3.0 content
    const vcardContent = cards
      .map((card) => {
        const firstName = escapeVCardText(card.firstName || '');
        const lastName = escapeVCardText(card.lastName || '');
        const phone = sanitizePhone(card.phone || '');
        
        // Fallback to phone number if both names are empty
        let formattedName = `${card.firstName || ''} ${card.lastName || ''}`.trim();
        if (!formattedName) {
          formattedName = phone || 'Unknown Contact';
        }
        const escapedFormattedName = escapeVCardText(formattedName);

        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${lastName};${firstName};;;`,
          `FN:${escapedFormattedName}`,
          `TEL;TYPE=CELL,VOICE:${phone}`,
          'END:VCARD',
        ].join('\r\n');
      })
      .join('\r\n');

    // Return as downloadable file
    return new NextResponse(vcardContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': 'attachment; filename="contacts.vcf"',
      },
    });
  } catch (error) {
    console.error('Error exporting contacts:', error);
    return NextResponse.json(
      { error: 'Failed to export contacts' },
      { status: 500 }
    );
  }
}
