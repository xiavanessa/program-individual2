const express = require("express");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const app = express();
const port = 8080;

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

// 中间件解析 JSON 和 URL 编码数据
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// register user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

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

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

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

// 获取所有用户
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
  const { username } = req.params;
  const { password, newUsername, newPassword } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  if (!newUsername && !newPassword) {
    return res
      .status(400)
      .json({ error: "At least one field is required to update." });
  }

  const transaction = await sequelize.transaction();

  try {
    // 查找用户
    const [users] = await sequelize.query(
      `SELECT * FROM Users WHERE username = ?`,
      { replacements: [username], transaction }
    );
    const user = users[0];

    // 验证密码
    if (user && (await bcrypt.compare(password, user.password))) {
      const updates = [];

      if (newUsername) {
        updates.push(`username = ?`);
      }
      if (newPassword) {
        updates.push(`password = ?`);
      }

      if (updates.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one field is required to update." });
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

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    // 查找用户
    const [users] = await sequelize.query(
      `SELECT * FROM Users WHERE username = ?`,
      { replacements: [username] }
    );
    const user = users[0];

    // 验证密码
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

// listen on port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// // register
// app.post("/register", async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .json({ error: "Username and password are required." });
//   }

//   try {
//     // Hash the password before saving it
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, password: hashedPassword });
//     res.status(201).json({ message: "User registered successfully." });
//   } catch (error) {
//     console.error(error);
//     if (error.name === "SequelizeUniqueConstraintError") {
//       res.status(409).json({ error: "Username already exists." });
//     } else {
//       console.error(error);
//       res.status(500).json({ error: "Error registering user." });
//     }
//   }
// });

// // 用户登录路由
// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .send({ error: "Username and password are required." });
//   }

//   try {
//     // 使用 username 查找用户
//     const user = await User.findOne({ where: { username } });

//     // 如果用户存在，验证密码
//     if (user && (await bcrypt.compare(password, user.password))) {
//       res.json({ message: "Login successful.", username: user.username });
//     } else {
//       res.status(401).json({ error: "Invalid username or password." });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error logging in." });
//   }
// });

// // 获取所有用户
// app.get("/users", async (req, res) => {
//   try {
//     const users = await User.findAll();
//     res.json({ users: users.map((user) => user.username) });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error retrieving users.");
//   }
// });

// // 更新用户
// app.put("/users/:username", async (req, res) => {
//   const { username } = req.params;
//   const { password, newUsername, newPassword } = req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .json({ error: "Username and password are required." });
//   }

//   if (!newUsername && !newPassword) {
//     return res
//       .status(400)
//       .json({ error: "At least one field is required to update." });
//   }

//   try {
//     // 使用 username 查找用户
//     const user = await User.findOne({ where: { username } });

//     // 如果用户存在，验证密码
//     if (user && (await bcrypt.compare(password, user.password))) {
//       if (newUsername) {
//         user.username = newUsername;
//       }
//       if (newPassword) {
//         user.password = await bcrypt.hash(newPassword, 10);
//       }
//       await user.save();
//       res.json({ message: "User updated successfully." });
//     } else {
//       res.status(401).json({ error: "Invalid username or password." });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error updating user." });
//   }
// });

// // 删除用户
// app.delete("/users/:username", async (req, res) => {
//   const { username } = req.params;
//   const { password } = req.body;

//   if (!username || !password) {
//     return res
//       .status(400)
//       .json({ error: "Username and password are required." });
//   }

//   try {
//     const user = await User.findOne({ where: { username } });

//     // 如果用户存在，验证密码
//     if (user && (await bcrypt.compare(password, user.password))) {
//       await user.destroy(); // 删除用户
//       res.json({ message: "User deleted successfully." });
//     } else {
//       res.status(401).json({ error: "Invalid username or password." });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error deleting user." });
//   }
// });
