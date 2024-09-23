const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

// 初始化数据库
let db = new sqlite3.Database("homeSection1.sqlite3.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the words database.");
});

// 返回 JSON 数据
router.get("/words", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = 6;
  const offset = page * limit;

  db.all(
    `SELECT Words.id, Words.word, Words.word_class, Words.word_forms, Words.word_definition, Details.example_1, Details.example_1_translation, 
          Details.example_2, Details.example_2_translation
          FROM Words 
          INNER JOIN Details ON Words.id = Details.word_id LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows); // 返回 JSON 数据
    }
  );
});

// 渲染 home 页面
router.get("/", (req, res) => {
  const limit = 6; // 初始加载时限制显示的单词数量
  db.all(
    `SELECT Words.id, Words.word, Words.word_class, Words.word_forms, Words.word_definition, Details.example_1, Details.example_1_translation, 
          Details.example_2, Details.example_2_translation
          FROM Words 
          INNER JOIN Details ON Words.id = Details.word_id LIMIT ?`,
    [limit],
    (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("home", { words: rows }); // 渲染页面
    }
  );
});

module.exports = router;
