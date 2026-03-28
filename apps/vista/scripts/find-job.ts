import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI ?? '';
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment');
  process.exit(1);
}

const target = process.argv[2] || '3VZ4rZGG05sH';

async function findJob() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database handle unavailable after MongoDB connection');
    }
    const collections = await db.listCollections().toArray();

    let found = false;
    for (const coll of collections) {
      const name = coll.name;
      const collection = db.collection(name);

      // Try common field names
      const queryFields = [
        { jobId: target },
        { job_id: target },
        { job: target },
        { uuid: target },
      ];

      for (const q of queryFields) {
        const doc = await collection.findOne(q);
        if (doc) {
          found = true;
          console.log('---');
          console.log(`Found in collection: ${name}`);
          console.log('Matching query:', JSON.stringify(q));
          // print a few useful fields if present
          const out: any = {};
          out.collection = name;
          out._id = doc._id;
          out.jobId = doc.jobId || doc.job_id || doc.job || doc.uuid || null;
          out.phone = doc.phone || doc.phoneNumber || doc.to || null;
          out.status = doc.status || null;
          out.sentAt = doc.sentAt || doc.sent_at || doc.createdAt || doc.created_at || null;
          out.createdAt = doc.createdAt || doc.created_at || null;
          out.raw = doc;
          console.log(JSON.stringify(out, null, 2));
        }
      }
    }

    if (!found) {
      console.log(`No documents found with jobId (or similar) = ${target}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
}

findJob();
