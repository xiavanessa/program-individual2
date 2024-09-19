const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();

// User database
const userDb = new sqlite3.Database("users.sqlite3.db", (err) => {
  if (err) {
    console.error("Error opening the database:", err.message);
  } else {
    console.log("Users database loaded successfully");
  }
});

// Register user
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => {
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
router.get("/protected-route", ensureAuthenticated, (req, res) => {
  res.json({
    message: "You have accessed a protected route",
    user: req.session.user,
  });
});

// Logout route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed." });
    }
    res.json({ message: "Logout successful." });
  });
});

// Retrieve all users
router.get("/users", (req, res) => {
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
router.put("/users/:username", async (req, res) => {
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
router.delete("/users/:username", (req, res) => {
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

module.exports = router;
