const express = require("express");
const path = require("path");
const app = express();
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

const port = 8080;

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.sync();

// 中间件 - 解析 JSON 请求体
app.use(express.json()); // 解析 JSON 数据
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的数据

// 用户注册路由
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error(error);
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({ error: "Username already exists." });
    } else {
      res.status(500).json({ error: "Error registering user." });
    }
  }
});

// 用户登录路由
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .send({ error: "Username and password are required." });
  }

  try {
    // 使用 username 查找用户
    const user = await User.findOne({ where: { username } });

    // 如果用户存在，验证密码
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
    const users = await User.findAll();
    res.json({ users: users.map((user) => user.username) });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users.");
  }
});

// 更新用户
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

  try {
    // 使用 username 查找用户
    const user = await User.findOne({ where: { username } });

    // 如果用户存在，验证密码
    if (user && (await bcrypt.compare(password, user.password))) {
      if (newUsername) {
        user.username = newUsername;
      }
      if (newPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
      }
      await user.save();
      res.json({ message: "User updated successfully." });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user." });
  }
});

// 删除用户
app.delete("/users/:username", async (req, res) => {
  const { username } = req.params;
  const { password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    // 使用 username 查找用户
    const user = await User.findOne({ where: { username } });

    // 如果用户存在，验证密码
    if (user && (await bcrypt.compare(password, user.password))) {
      await user.destroy(); // 删除用户
      res.json({ message: "User deleted successfully." });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting user." });
  }
});

// 先注册静态资源中间件
app.use(express.static(path.join(__dirname, "public")));

// 定义根路由
app.get("/", function (req, res) {
  res.send("Hello World");
});

//处理/index 路由，确保发送正确的文件路径
app.get("/index", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html")); // 如果 index.html 在项目根目录下
});

// 处理 /website 路由，确保发送正确的文件路径
app.get("/website", function (req, res) {
  res.sendFile(path.join(__dirname, "website.html")); // 如果 website.html 在项目根目录下
});

// 处理 /wordpage 路由，返回 wordPage.html 文件
app.get("/wordpage", function (req, res) {
  res.sendFile(path.join(__dirname, "wordPage.html")); // 确保文件在 public 文件夹中
});

// 启动服务器并监听端口
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
