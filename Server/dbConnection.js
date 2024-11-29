import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017";
const dbName = "myDB";

let client;
let db;
export default async function connectToDB() {
    try {
        if (!client) {
            client = new MongoClient(uri);
            await client.connect();
            console.log("Connected to MongoDB!");
            db = client.db(dbName);
        }
        return db;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
}

