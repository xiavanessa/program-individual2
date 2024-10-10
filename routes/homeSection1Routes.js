const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

let db = new sqlite3.Database("homeSection1.sqlite3.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the words database.");
});

// helper function to get total number of items
function getTotalItems(callback) {
  const countQuery = "SELECT COUNT(*) AS count FROM Words";
  db.get(countQuery, (err, row) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, row.count);
  });
}

router.get("/words", (req, res) => {
  const page = parseInt(req.query.page) || 1; //default page 1
  const limit = 6; //6 words per page
  const offset = (page - 1) * limit;

  getTotalItems((err, totalItems) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // total pages
    const totalPages = Math.ceil(totalItems / limit);

    // count the total number of items
    const query = `
        SELECT Words.id, Words.word, Words.word_class, Words.word_forms, Words.word_definition, Details.example_1, Details.example_1_translation, Details.example_2, Details.example_2_translation FROM Words 
        INNER JOIN Details ON Words.id = Details.word_id 
        LIMIT ? OFFSET ?`;

    db.all(query, [limit, offset], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const response = {
        words: rows,
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limit,
      };

      // console.log(response);
      res.json(response);
    });
  });
});

// render home page
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  getTotalItems((err, totalItems) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const totalPages = Math.ceil(totalItems / limit);

    const query = `
        SELECT Words.id, Words.word, Words.word_class, Words.word_forms, Words.word_definition, 
               Details.example_1, Details.example_1_translation, Details.example_2, Details.example_2_translation
        FROM Words 
        INNER JOIN Details ON Words.id = Details.word_id 
        LIMIT ? OFFSET ?`;

    db.all(query, [limit, offset], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }

      res.render("home", {
        words: rows,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        layout: "main", // 使用 main.handlebars 作为布局
        title: "Home", // 设置页面标题
        isLoggedIn: !!req.session.user,
      });
    });
  });
});

module.exports = router;
