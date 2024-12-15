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
    try {
        const user = await req.db.collection("myCollection").findOne({ username, password });
        if (user) {
            req.session.user = user;
            res.render("home");
        } else {
            res.render("login", { error: "Invalid username or password" });
        }
    } catch (err) {
        console.log(err);
        res.send("An error occurred while logging in.");
    }
});


app.get("/inca",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/PThD_KgLXUA?si=fIbKv0aUBFc59GTs";
    if(req.session.user){
        res.render("inca", { youtubeLink: youtubeVideoLink });
    }else{
        res.render("login");
    }
})
app.get("/annapurna",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/Ec-wj56Zp-Q?si=3TNaHSG16pqpk4db" ;
    if(req.session.user){
        res.render("annapurna", { youtubeLink: youtubeVideoLink });
    }else{
        res.render("login");
    }
})
app.get("/paris",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/6JAESY0by04?si=Z00lBbQQviZFigHn" ;
    if(req.session.user){
        res.render("paris", { youtubeLink: youtubeVideoLink });
    }else{
        res.render("login");
    }
})
app.get("/rome",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/2x16HZIzsKQ?si=DoAL33zjFEXAdMq9";
    if(req.session.user){
        res.render("rome", { youtubeLink: youtubeVideoLink });
    }else{
        res.render("login");
    }
})
app.get("/bali",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/Dw-Bhwf-ozI?si=32zEoU9bYlrfdPTw";
    if(req.session.user){
        res.render("bali", { youtubeLink: youtubeVideoLink });
    }else{
        res.render("login");
    }
})
app.get("/santorini",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/MUIMSBomVUA?si=LEdcwG15vG-e4XNq" ;
    if(req.session.user){
        res.render("santorini", { youtubeLink: youtubeVideoLink });
    }else{
        res.render("login");
    }
})
app.post("/add-to-want-to-go-list", async(req,res)=>{
    const { destination } = req.body;
    const username= req.session.user.username;
    try{
        const user = await req.db.collection("myCollection").findOne({ username });
        if (!user) {
            return res.status(404).send("User not found.");
        }
        if (user.wantToGoList && user.wantToGoList.includes(destination)) {
            return res.status(400).send("This destination is already in your want-to-go list.");
        }
        await req.db.collection("myCollection").updateOne(
            { username },
            { $addToSet: { wantToGoList: destination } }
        );
        res.send("Successfully added to your want-to-go list!");
    }
    catch (err) {
        console.error("Error adding to want-to-go list:", err);
        res.status(500).send("Failed to add destination to the list.");
    }

})


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
app.get('/home', (req, res) => {
    if(req.session.user){
        res.render('home'); 
    }else{
        res.send("Please login first.");
    }
});
app.get('/hiking', (req, res) => {
    if(req.session.user){
        res.render('hiking'); 
    }else{
        res.render("login");
    }
});


app.get('/cities', (req, res) => {
    if(req.session.user){
        res.render('cities'); 
    }else{
        res.render("login");
    } 
});


app.get('/islands', (req, res) => {
    if(req.session.user){
        res.render('islands'); 
    }else{
        res.render("login");
    } 
});

app.get('/wanttogo', function (req, res) {
    const user1 = req.session.user.username;
  
    req.db.collection('myCollection')
      .findOne({ username: user1 })
      .then((user) => {
        if (!user) {
          return res.status(404).send("User not found.");
        }
  
        const wantToGoList = user.wantToGoList || [];
        res.render('wanttogo', { items: wantToGoList });
      })
      .catch((err) => {
        console.error('Error fetching data', err);
        res.status(500).send('Error fetching data');
      });
  });
  
  

app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
});

app.get("/registration", (req, res) => {
    res.render("registration");
});
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await req.db.collection("myCollection").findOne({ username });
        if (existingUser) {
            res.send("Username already exists. Please choose a different one.");
        } else {
            const user = {username,password}
            await req.db.collection("myCollection").insertOne(user);
            res.redirect("/");
        }
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).send("An error occurred during registration. Please try again later.");
    }
});


