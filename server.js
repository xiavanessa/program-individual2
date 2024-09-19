const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
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

//db
const db = new sqlite3.Database("vocabulary.sqlite3.db", (err) => {
  if (err) {
    console.error("Error opening the database:", err.message);
  } else {
    console.log("Database loaded successfully");
  }
});

app.get("/words", (req, res) => {
  // 查询数据库获取单词
  const query = `SELECT id, english, indefinite_singular AS indefiniteSingular,definite_singular AS definiteSingular, indefinite_plural AS indefinitePlural, definite_plural AS definitePlural, example_sentence AS example, is_custom FROM Wordpage__nouns`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }

    // 使用Handlebars渲染模板，并传递数据
    res.render("wordpage", { words: rows });
  });
});

app.get("/about", (req, res) => {
  res.render("about", { firstname: "Yehuda", lastname: "Katz" });
});

app.post("/add-word", (req, res) => {
  const {
    english,
    indefiniteSingular,
    definiteSingular,
    indefinitePlural,
    definitePlural,
    example,
  } = req.body;

  console.log("Received data:", {
    english,
    indefiniteSingular,
    definiteSingular,
    indefinitePlural,
    definitePlural,
    example,
  });

  const query = `
    INSERT INTO Wordpage__nouns (english, indefinite_singular, definite_singular, indefinite_plural, definite_plural, example_sentence, is_custom)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `;

  db.run(
    query,
    [
      english,
      indefiniteSingular,
      definiteSingular,
      indefinitePlural,
      definitePlural,
      example,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Word added successfully", id: this.lastID });
    }
  );
});

app.delete("/delete-word/:id", (req, res) => {
  const wordId = req.params.id;
  console.log("Received delete request for ID:", wordId);

  // only delete custom words (is_custom = 1)
  const query = `DELETE FROM Wordpage__nouns WHERE id = ? AND is_custom = 1`;

  db.run(query, [wordId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Word deleted successfully" });
  });
});

// Routes
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
