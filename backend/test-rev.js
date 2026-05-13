import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const revs = await mongoose.connection.db.collection('reviews').find({}).limit(1).toArray();
    console.log("Raw review:", JSON.stringify(revs, null, 2));

    const users = await mongoose.connection.db.collection('users').find({ _id: revs[0].user }).toArray();
    console.log("Associated User:", JSON.stringify(users, null, 2));

    process.exit(0);
};

run().catch(console.dir);
