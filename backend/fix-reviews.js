import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const revs = await mongoose.connection.db.collection('reviews').find({}).toArray();
    let count = 0;
    for (const r of revs) {
        const updates = {};
        if (typeof r.user === 'string') updates.user = new mongoose.Types.ObjectId(r.user);
        if (typeof r.product === 'string') updates.product = new mongoose.Types.ObjectId(r.product);
        
        if (Object.keys(updates).length > 0) {
            await mongoose.connection.db.collection('reviews').updateOne(
                { _id: r._id },
                { $set: updates }
            );
            count++;
        }
    }
    console.log(`Fixed ${count} reviews!`);
    process.exit(0);
};

run().catch(console.dir);
