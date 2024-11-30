import express from "express";
import path from "path";
import connectToDB from "./dbConnection.js";

const app = express();
const Port = 3000;
const __dirname = path.resolve(); // Resolve current directory


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
    res.render("home");
});


app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
});
