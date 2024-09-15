const express = require("express");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const app = express();
const port = 8080;

// Create SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database2.sqlite",
});

// Create User table
sequelize.query(
  `CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`
);

// parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// register user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user into database
    await sequelize.query(
      `INSERT INTO Users (username, password) VALUES (?, ?)`,
      { replacements: [username, hashedPassword] }
    );

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error(error);
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(409).json({ error: "Username already exists." });
    } else {
      res.status(500).json({ error: "Error registering user." });
    }
  }
});

// login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // search user
    const [users] = await sequelize.query(
      `SELECT * FROM Users WHERE username = ?`,
      { replacements: [username] }
    );
    const user = users[0];

    // verify password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ message: "Login successful.", username: user.username });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in." });
  }
});

// retrieve all users
app.get("/users", async (req, res) => {
  try {
    const [users] = await sequelize.query(`SELECT username FROM Users`);

    res.json({ users: users.map((user) => user.username) });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users.");
  }
});

// update user
app.put("/users/:username", async (req, res) => {
  console.log(req);
  const { username } = req.params;
  const { password, newUsername, newPassword } = req.body;

  if (!newUsername && !newPassword) {
    return res
      .status(400)
      .json({ error: "At least one field is required to update." });
  }

  const transaction = await sequelize.transaction();

  try {
    // search user
    const [users] = await sequelize.query(
      `SELECT * FROM Users WHERE username = ?`,
      { replacements: [username], transaction }
    );
    const user = users[0];

    // verify password
    if (user && (await bcrypt.compare(password, user.password))) {
      const updates = [];

      if (newUsername) {
        updates.push(`username = ?`);
      }
      if (newPassword) {
        updates.push(`password = ?`);
      }

      const updateQuery = `UPDATE Users SET ${updates.join(
        ", "
      )} WHERE username = ?`;
      const replacements = [];

      if (newUsername) {
        replacements.push(newUsername);
      }
      if (newPassword) {
        replacements.push(await bcrypt.hash(newPassword, 10));
      }
      replacements.push(username);

      await sequelize.query(updateQuery, { replacements, transaction });

      await transaction.commit();
      res.json({ message: "User updated successfully." });
    } else {
      await transaction.rollback();
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ error: "Error updating user." });
  }
});

// delete user
app.delete("/users/:username", async (req, res) => {
  const { username } = req.params;
  const { password } = req.body;

  try {
    const [users] = await sequelize.query(
      `SELECT * FROM Users WHERE username = ?`,
      { replacements: [username] }
    );
    const user = users[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      await sequelize.query(`DELETE FROM Users WHERE username = ?`, {
        replacements: [username],
      });
      res.json({ message: "User deleted successfully." });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting user." });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

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

app.get("/about", function (req, res) {
  res.sendFile(path.join(__dirname, "about.html"));
});

app.get("/contact", function (req, res) {
  res.sendFile(path.join(__dirname, "contact.html"));
});

// listen on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
