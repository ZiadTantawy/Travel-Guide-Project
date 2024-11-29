import express from 'express';
import session from 'express-session';
import ejs from 'ejs';
import connectToDB from './dbConnection.js';

const app = express();
const Port = 3000;

app.use(async (req, res, next) => {
    try {
        req.db = await connectToDB();
        next();
    } catch (err) {
        res.status(500).send("Failed to connect to the database.");
    }
});

app.get("/", (req, res) => {
    res.send("Welcome to the Travel Guide!");
});

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
