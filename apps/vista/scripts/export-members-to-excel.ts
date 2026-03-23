import mongoose from 'mongoose';
import * as ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Card Schema
interface ICard extends Document {
  firstName: string;
  lastName: string;
  phone: string;
}

const CardSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  preference: { type: String, required: false, default: '' },
  dob: { type: Date, required: false },
  anniversary: { type: Date, required: false },
  content: { type: String, required: false },
  scanHistory: [{ timestamp: Date }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

async function exportMembersToExcel() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!);
    console.log('✓ Connected to MongoDB');

    // Fetch all members
    const members = await Card.find().lean().exec();
    console.log(`✓ Found ${members.length} members`);

    if (members.length === 0) {
      console.log('⚠ No members found in database');
      await mongoose.disconnect();
      return;
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Members');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Contact Number', key: 'phone', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Add data rows
    members.forEach((member: any) => {
      const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
      const phone = member.phone || '';

      worksheet.addRow({
        name: fullName,
        phone: phone,
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value?.toString().length || 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Save file to vista/public directory
    const outputDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `members-${new Date().toISOString().split('T')[0]}.xlsx`;
    const filePath = path.join(outputDir, filename);

    await workbook.xlsx.writeFile(filePath);
    console.log(`✓ Excel file created: ${filePath}`);
    console.log(`✓ Total members exported: ${members.length}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('✗ Error exporting members:', error);
    process.exit(1);
  }
}

exportMembersToExcel();
