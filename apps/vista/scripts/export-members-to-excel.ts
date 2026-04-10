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
      { header: 'UUID', key: 'uuid', width: 38 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Contact Number', key: 'phone', width: 20 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Preference', key: 'preference', width: 20 },
      { header: 'Date of Birth', key: 'dob', width: 15 },
      { header: 'Anniversary', key: 'anniversary', width: 15 },
      { header: 'Content', key: 'content', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 22 },
      { header: 'Updated At', key: 'updatedAt', width: 22 },
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
      worksheet.addRow({
        uuid: member.uuid || '',
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        phone: member.phone || '',
        address: member.address || '',
        preference: member.preference || '',
        dob: member.dob ? new Date(member.dob).toISOString().split('T')[0] : '',
        anniversary: member.anniversary ? new Date(member.anniversary).toISOString().split('T')[0] : '',
        content: member.content || '',
        createdAt: member.createdAt ? new Date(member.createdAt).toISOString() : '',
        updatedAt: member.updatedAt ? new Date(member.updatedAt).toISOString() : '',
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
