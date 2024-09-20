const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

// Word database setup
const db = new sqlite3.Database("vocabulary.sqlite3.db", (err) => {
  if (err) {
    console.error("Error opening the vocabulary database:", err.message);
  } else {
    console.log("Vocabulary database loaded successfully");
  }
});

// Retrieve words, pagination
router.get("/", (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10; //  10 items per page
  const offset = (page - 1) * limit;

  const query = `
      SELECT id, english, indefinite_singular AS indefiniteSingular,
      definite_singular AS definiteSingular, indefinite_plural AS indefinitePlural,
      definite_plural AS definitePlural, example_sentence AS example, is_custom
      FROM Wordpage__nouns
      LIMIT ? OFFSET ?`;

  db.all(query, [limit, offset], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }

    //total number of items
    const countQuery = `SELECT COUNT(*) AS count FROM Wordpage__nouns`;
    db.get(countQuery, [], (countErr, countRow) => {
      if (countErr) {
        return console.error(countErr.message);
      }

      const totalItems = countRow.count;
      const totalPages = Math.ceil(totalItems / limit);
      res.render("wordpage", {
        words: rows,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
      });
    });
  });
});

// Add a word
router.post("/add-word", (req, res) => {
  const {
    english,
    indefiniteSingular,
    definiteSingular,
    indefinitePlural,
    definitePlural,
    example,
  } = req.body;

  const query = `
      INSERT INTO Wordpage__nouns (english, indefinite_singular, definite_singular,
        indefinite_plural, definite_plural, example_sentence, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, 1)`;

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

      // Retrieve the total count of words after addition
      const countQuery = `SELECT COUNT(*) AS count FROM Wordpage__nouns`;
      db.get(countQuery, [], (countErr, countRow) => {
        if (countErr) {
          return res.status(500).json({ error: countErr.message });
        }

        const totalItems = countRow.count;
        const totalPages = Math.ceil(totalItems / 10); //10items per page

        res.json({
          message: "Word added successfully",
          id: this.lastID,
          totalPages: totalPages,
        });
      });
    }
  );
});

// Delete a word
router.delete("/delete-word/:id", (req, res) => {
  const wordId = req.params.id;

  const query = `DELETE FROM Wordpage__nouns WHERE id = ? AND is_custom = 1`;

  db.run(query, [wordId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Word deleted successfully" });
  });
});

// Update a word
router.put("/update-word/:id", (req, res) => {
  const wordId = req.params.id;
  const {
    english,
    indefiniteSingular,
    definiteSingular,
    indefinitePlural,
    definitePlural,
    example,
  } = req.body;

  console.log("Update word", wordId, english, indefiniteSingular);

  const query = `
      UPDATE Wordpage__nouns
      SET english = ?, indefinite_singular = ?, definite_singular = ?, indefinite_plural = ?, definite_plural = ?, example_sentence = ?
      WHERE id = ? AND is_custom = 1
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
      wordId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Word updated successfully" });
    }
  );
});

module.exports = router;
