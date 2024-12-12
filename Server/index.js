import express from "express";
import path from "path";
import connectToDB from "./dbConnection.js";

const app = express();
const Port = 3000;
const __dirname = path.resolve();


app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

app.use(async (req, res, next) => {
    try {
        req.db = await connectToDB();
        next();
    } catch (err) {
        console.error("Database connection error:", err);
        res.status(500).send("Failed to connect to the database.");
    }
});

app.get("/", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await req.db.collection("users").findOne({ username, password });
    if (user) {
        res.render("home");
    } else {
        res.send("Invalid username or password.");
    }
});


app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
});
// Serve registration form
app.get("/registration", (req, res) => {
    res.render("registration"); // Serve the registration form from 'views/register.ejs'
});

// Handle registration
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await req.db.collection("myCollection").findOne({ username });
        if (existingUser) {
            res.send("Username already exists. Please choose a different one.");
        } else {
            await req.db.collection("myCollection").insertOne({ username, password });
            res.render("home");
        }
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).send("An error occurred during registration. Please try again later.");
    }
});
