import express from "express";
import path from "path";
import connectToDB from "./dbConnection.js";
import session from "express-session";


const app = express();
const Port = 3000;
const __dirname = path.resolve();


app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.get("/images/:name", (req, res) => {
    const imagePath = path.join(__dirname, "../public", req.params.name + ".png");
    res.sendFile(imagePath, (err) => {
        if (err) {
            console.error("Error serving image:", err);
            res.status(404).send("Image not found");
        }
    });
});

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

app.post("/", async (req, res) => {
    const { username, password } = req.body;
    try{
        const user = await req.db.collection("myCollection").findOne({username: username, password: password});
        if(user){
            req.session.user = user;
            res.render("home");
        }else{
            res.send("Invalid username or password");
        }
    }catch(err){
        console.log(err);
        res.send("An error occurred while logging in.");
    }
});


app.post("/search", async (req, res) => {
    let Search = req.body.Search;
    Search = Search.trim();
    if(Search === ""){
        res.send("Please enter a search term.");
        return;
    }
    try {
        const results = await req.db.collection("Destinations").find({
            name: { $regex: Search, $options: "i" },
        }).toArray();
        if (results.length > 0) {
            res.render("searchresults", { destinations: results });
        } else {
            res.send("No results found.");
        }
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).send("An error occurred while searching for destinations.");
    }
});

app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
});


