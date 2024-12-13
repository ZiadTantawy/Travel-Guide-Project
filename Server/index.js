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

app.get("/inca",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/PThD_KgLXUA?si=fIbKv0aUBFc59GTs";
    res.render("inca", { youtubeLink: youtubeVideoLink });
})
app.get("/annapurna",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/Ec-wj56Zp-Q?si=3TNaHSG16pqpk4db" ;
    res.render("annapurna", { youtubeLink: youtubeVideoLink });
})
app.get("/paris",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/6JAESY0by04?si=Z00lBbQQviZFigHn" ;
    res.render("paris", { youtubeLink: youtubeVideoLink });
})
app.get("/rome",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/2x16HZIzsKQ?si=DoAL33zjFEXAdMq9";
    res.render("rome", { youtubeLink: youtubeVideoLink });
})
app.get("/bali",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/Dw-Bhwf-ozI?si=32zEoU9bYlrfdPTw";
    res.render("bali", { youtubeLink: youtubeVideoLink });
})
app.get("/santorini",(req,res)=>{
    const youtubeVideoLink = "https://www.youtube.com/embed/MUIMSBomVUA?si=LEdcwG15vG-e4XNq" ;
    res.render("santorini",{ youtubeLink: youtubeVideoLink });
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
  res.render('home'); 
});
app.get('/hiking', (req, res) => {
  res.render('hiking'); 
});


app.get('/cities', (req, res) => {
  res.render('cities'); 
});


app.get('/islands', (req, res) => {
  res.render('islands'); 
});


// app.get('/wanttogo', function(req, res) {
//     const user1 = req.session.user.username;
//     req.db.collection('myCollection')
//       .find({username: user1})
//       .toArray()
//       .then((data) => {      
//         res.render('wanttogo', { items: data });
//       })
//       .catch((err) => {
//         console.error('Error fetching data', err);
//         res.status(500).send('Error fetching data');
//       });
//   });

app.get('/wanttogo', function (req, res) {
    const user1 = req.session.user.username;
  
    req.db.collection('myCollection')
      .findOne({ username: user1 })
      .then((user) => {
        if (!user) {
          return res.status(404).send("User not found.");
        }
  
        const wantToGoList = user.wantToGoList || []; // Get wantToGoList or an empty array if it doesn't exist
        res.render('wanttogo', { items: wantToGoList }); // Pass only the wantToGoList array
      })
      .catch((err) => {
        console.error('Error fetching data', err);
        res.status(500).send('Error fetching data');
      });
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


