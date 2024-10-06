const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 8080;

// Register Handlebars helpers
const hbs = engine({
  helpers: {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    greaterThan: (a, b) => a > b,
    lessThan: (a, b) => a < b,
    equal: (a, b) => a === b,
  },
});

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
app.engine("handlebars", hbs);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Import and use routes
//user manangement system routes
const userRoutes = require(path.join(__dirname, "routes/userRoutes"));
app.use("/users", userRoutes);
//word manangement system routes
const wordRoutes = require(path.join(__dirname, "routes/wordRoutes"));
app.use("/words", wordRoutes);
//homeSection1 routes
const homeSection1 = require(path.join(__dirname, "routes/homeSection1Routes"));
app.use("/home", homeSection1);

// Routes
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});

app.get("/contact", function (req, res) {
  res.sendFile(path.join(__dirname, "contact.html"));
});

// listen on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
