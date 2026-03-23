import * as ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

interface MemberRecord {
  name: string;
  phone: string;
}

async function mergeExcelFiles() {
  try {
    const sourceFile = process.argv[2]; // Accept file path as command argument
    const dataDir = path.join(process.cwd(), 'data');
    let existingFile = path.join(dataDir, 'members-2026-03-23.xlsx');

    if (!sourceFile) {
      console.error('✗ Please provide the source Excel file path as an argument');
      console.error('Usage: tsx merge-excel-members.ts <path-to-ecard-members.xlsx>');
      process.exit(1);
    }

    if (!fs.existsSync(sourceFile)) {
      console.error(`✗ Source file not found: ${sourceFile}`);
      process.exit(1);
    }

    // Check if existing file is in data dir, otherwise check public dir
    if (!fs.existsSync(existingFile)) {
      existingFile = path.join(process.cwd(), 'public', 'members-2026-03-23.xlsx');
      if (!fs.existsSync(existingFile)) {
        console.error(`✗ Existing file not found in data/ or public/`);
        process.exit(1);
      }
    }

    // Read existing file
    console.log('📖 Reading existing members file...');
    const existingWorkbook = new ExcelJS.Workbook();
    await existingWorkbook.xlsx.readFile(existingFile);
    const existingSheet = existingWorkbook.getWorksheet('Members');

    if (!existingSheet) {
      console.error('✗ "Members" worksheet not found in existing file');
      process.exit(1);
    }

    // Extract existing members into a set for quick lookup
    const existingMembers = new Set<string>();
    existingSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const nameValue = row.getCell(1).value;
      const phoneValue = row.getCell(2).value;

      const name = nameValue ? String(nameValue).trim() : '';
      const phone = phoneValue ? String(phoneValue).trim() : '';

      if (name || phone) {
        const key = `${name.toLowerCase()}|${phone}`;
        existingMembers.add(key);
      }
    });

    console.log(`✓ Found ${existingMembers.size} existing members`);

    // Read source file
    console.log('📖 Reading source file...');
    const sourceWorkbook = new ExcelJS.Workbook();
    await sourceWorkbook.xlsx.readFile(sourceFile);
    const sourceSheet = sourceWorkbook.worksheets[0];

    if (!sourceSheet) {
      console.error('✗ No worksheet found in source file');
      process.exit(1);
    }

    // Extract new members
    const newMembers: MemberRecord[] = [];
    const duplicates: MemberRecord[] = [];
    let rowsProcessed = 0;

    sourceSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const nameValue = row.getCell(1).value;
      const phoneValue = row.getCell(2).value || row.getCell('B').value;

      const name = nameValue ? String(nameValue).trim() : '';
      const phone = phoneValue ? String(phoneValue).trim() : '';

      if (!name && !phone) return; // Skip empty rows

      rowsProcessed++;
      const key = `${name.toLowerCase()}|${phone}`;

      if (!existingMembers.has(key)) {
        newMembers.push({ name, phone });
      } else {
        duplicates.push({ name, phone });
      }
    });

    console.log(`✓ Processed ${rowsProcessed} rows from source file`);
    console.log(`✓ Found ${newMembers.length} unique new members`);
    console.log(`⚠ Found ${duplicates.length} duplicate members (skipped)`);

    // Add new members to existing file
    if (newMembers.length > 0) {
      newMembers.forEach((member) => {
        existingSheet.addRow({
          name: member.name,
          phone: member.phone,
        });
      });

      // Save updated file
      await existingWorkbook.xlsx.writeFile(existingFile);
      console.log(`✓ Updated file saved: ${existingFile}`);
      console.log(`✓ Total members now: ${existingMembers.size + newMembers.length}`);
    } else {
      console.log('ℹ No new unique members to add');
    }
  } catch (error) {
    console.error('✗ Error merging files:', error);
    process.exit(1);
  }
}

mergeExcelFiles();
