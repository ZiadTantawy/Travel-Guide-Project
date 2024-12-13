import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017";
const dbName = "myDB";
const destinations = [
    {name:"inca"},
    {name:"annapurna"},
    {name:"paris"},
    {name:"bali"},
    {name:"santorini"},
    {name:"rome"},
]


let client;
let db;

export default async function connectToDB() {
    try {
        if (!client) {
            client = new MongoClient(uri);
            await client.connect();
            console.log("Connected to MongoDB!");
            db = client.db(dbName);

            const collections = await db.listCollections({ name: "Destinations" }).toArray();
            if (collections.length === 0) {
                await db.createCollection("Destinations");
                console.log(`Collection '${"Destinations"}' created successfully.`);
                addDestinations(destinations);
            } else {
                console.log(`Collection '${"Destinations"}' already exists.`);
            }
        }
        return db;
    } catch (err) {
        console.error("Error connecting to MongoDB or creating collection:", err);
        throw err;
    }
}

async function addDestinations(destinations) {
        try {
            const db = await connectToDB();
            const collection = db.collection("Destinations");
            const result = await collection.insertMany(destinations);
        } catch (err) {
            console.error("Error adding destinations:", err);
        }
    }
    