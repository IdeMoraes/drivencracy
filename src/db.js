import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.MONGO_URI);
const mongoClient = new MongoClient(process.env.MONGO_URI);
await mongoClient.connect();
const db = mongoClient.db('Drivencracy');

export default db;