const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");

const app = express();
const port = 8080;

// set up handlebars as the view engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars"); // Set the view engine to handlebars
app.set("views", path.join(__dirname, "views")); // Set the views directory

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set up session middleware
app.use(
  session({
    secret: "yourSecretKey", // You should replace this with an environment variable in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure to true if you are using HTTPS
  })
);

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

//user management system
// Create SQLite database
const userDb = new sqlite3.Database("users.sqlite3.db", (err) => {
  if (err) {
    console.error("Error opening the database:", err.message);
  } else {
    console.log("Users database loaded successfully");
    // Create Users table if it does not exist
    userDb.run(
      `CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating Users table:", err.message);
        }
      }
    );
  }
});

// Register user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO Users (username, password) VALUES (?, ?)`;

    userDb.run(query, [username, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          res.status(409).json({ error: "Username already exists." });
        } else {
          res.status(500).json({ error: "Error registering user." });
        }
      } else {
        res.status(201).json({ message: "User registered successfully." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user." });
  }
});

// Login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM Users WHERE username = ?`;

  userDb.get(query, [username], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error logging in." });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = { username: user.username };
      res.json({ message: "Login successful.", username: user.username });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  });
});

// Middleware to protect routes
const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    res.status(401).json({ error: "Unauthorized. Please log in." });
  }
};

// Protected route
app.get("/protected-route", ensureAuthenticated, (req, res) => {
  res.json({
    message: "You have accessed a protected route",
    user: req.session.user,
  });
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed." });
    }
    res.json({ message: "Logout successful." });
  });
});

// Retrieve all users
app.get("/users", (req, res) => {
  const query = `SELECT username FROM Users`;

  userDb.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving users.");
    }
    res.json({ users: rows.map((row) => row.username) });
  });
});

// Update user
app.put("/users/:username", async (req, res) => {
  const { username } = req.params;
  const { password, newUsername, newPassword } = req.body;

  const transaction = await new Promise((resolve, reject) => {
    userDb.serialize(() => {
      userDb.run("BEGIN TRANSACTION", (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });

  try {
    const query = `SELECT * FROM Users WHERE username = ?`;
    userDb.get(query, [username], async (err, user) => {
      if (err) {
        await new Promise((resolve) => userDb.run("ROLLBACK", resolve));
        throw err;
      }

      if (user && (await bcrypt.compare(password, user.password))) {
        const updates = [];
        const params = [];

        if (newUsername) {
          updates.push("username = ?");
          params.push(newUsername);
        }
        if (newPassword) {
          updates.push("password = ?");
          params.push(await bcrypt.hash(newPassword, 10));
        }

        const updateQuery = `UPDATE Users SET ${updates.join(
          ", "
        )} WHERE username = ?`;
        params.push(username);

        userDb.run(updateQuery, params, (err) => {
          if (err) {
            new Promise((resolve) => userDb.run("ROLLBACK", resolve));
            return res.status(500).json({ error: "Error updating user." });
          }

          new Promise((resolve) => userDb.run("COMMIT", resolve));
          res.json({ message: "User updated successfully." });
        });
      } else {
        new Promise((resolve) => userDb.run("ROLLBACK", resolve));
        res.status(401).json({ error: "Invalid username or password." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user." });
  }
});

// Delete user
app.delete("/users/:username", (req, res) => {
  const { username } = req.params;
  const { password } = req.body;

  const query = `SELECT * FROM Users WHERE username = ?`;

  userDb.get(query, [username], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error deleting user." });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      userDb.run(`DELETE FROM Users WHERE username = ?`, [username], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error deleting user." });
        }
        res.json({ message: "User deleted successfully." });
      });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
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
