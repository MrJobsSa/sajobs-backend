const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "jobsite_secret_key";
const EMPLOYER_CODE = "SAJOBS2026";

// Register
router.post("/register", (req, res) => {
  const { name, email, password, employerCode } = req.body;
if (employerCode !== EMPLOYER_CODE) {
  return res.status(401).json({ error: "Invalid employer code. Please contact SA Jobs to get your code." });
}
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = "INSERT INTO employers (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
  console.error("Register error:", err.message);
  return res.status(500).json({ error: err.message });
  }
    res.json({ message: "Employer registered successfully!" });
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM employers WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });
    const employer = results[0];
    const isMatch = bcrypt.compareSync(password, employer.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign({ id: employer.id, name: employer.name, email: employer.email }, SECRET, { expiresIn: "1d" });
   res.json({ message: "Login successful!", token, name: employer.name, id: employer.id });
  });
});

module.exports = router;