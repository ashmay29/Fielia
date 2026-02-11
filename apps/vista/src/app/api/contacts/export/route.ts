import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Card from '@/models/Card';
import { getSession } from '@/lib/auth';

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
        const firstName = card.firstName || '';
        const lastName = card.lastName || '';
        const phone = card.phone || '';
        const formattedName = `${firstName} ${lastName}`.trim();

        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${lastName};${firstName};;;`,
          `FN:${formattedName}`,
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
