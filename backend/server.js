const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const queriesFile = path.join(__dirname, "../Queries/SaveQueries.sql");

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ Connected to Local MySQL successfully!");
  }
});

app.post("/query", (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: "No SQL provided" });

  db.query(sql, (err, result, fields) => {
    if (err) return res.status(400).json({ error: err.message });

    if (Array.isArray(result)) {
      res.json({ columns: fields.map((f) => f.name), rows: result });
    } else {
      res.json({ message: "Query executed successfully", result });
    }
  });
});

app.post("/save", (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: "No SQL provided" });

  fs.appendFile(queriesFile, sql + "\n", (err) => {
    if (err) {
      console.error("❌ Failed to save query:", err);
      return res.status(500).json({ error: "Failed to save query" });
    }
    res.json({ message: "✅ Query saved successfully!" });
  });
});

app.get("/load", (req, res) => {
  fs.readFile(queriesFile, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Failed to load queries:", err);
      return res.status(500).json({ error: "Failed to load queries" });
    }
    const queries = data
      .split("\n")
      .filter(q => q.trim() !== "")
      .reverse();

    res.json({ queries });
  });
});



app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
