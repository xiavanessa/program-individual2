const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set up session middleware
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, //if https - true
  })
);

// set up handlebars as the view engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars"); // Set the view engine to handlebars
app.set("views", path.join(__dirname, "views")); // Set the views directory

// Import and use routes
//user manangement system routes
const userRoutes = require(path.join(__dirname, "routes/userRoutes"));
app.use("/users", userRoutes);
//word manangement system routes
const wordRoutes = require(path.join(__dirname, "routes/wordRoutes"));
app.use("/words", wordRoutes);

// Routes
app.get("/about", (req, res) => {
  res.render("about", { firstname: "Yehuda", lastname: "Katz" });
});

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/index", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/website", function (req, res) {
  res.sendFile(path.join(__dirname, "website.html"));
});

app.get("/wordpage", function (req, res) {
  res.sendFile(path.join(__dirname, "wordPage.html"));
});

app.get("/contact", function (req, res) {
  res.sendFile(path.join(__dirname, "contact.html"));
});

// listen on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
