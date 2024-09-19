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

// Retrieve all words
router.get("/", (req, res) => {
  const query = `
    SELECT id, english, indefinite_singular AS indefiniteSingular,
    definite_singular AS definiteSingular, indefinite_plural AS indefinitePlural,
    definite_plural AS definitePlural, example_sentence AS example, is_custom
    FROM Wordpage__nouns`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("wordpage", { words: rows });
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
      res.json({ message: "Word added successfully", id: this.lastID });
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

module.exports = router;
