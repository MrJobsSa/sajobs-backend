const express = require("express");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ramaitsane00@mail@gmail.com",
    pass: "djqrflfsqcufhavv"
  }
});
const jwt = require("jsonwebtoken");
const SECRET = "jobsite_secret_key";

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.employer = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
const router = express.Router();
const db = require("../db");

// Get all jobs
router.get("/", (req, res) => {
  db.query(`SELECT jobs.*, employers.name as employer_name 
  FROM jobs 
  LEFT JOIN employers ON jobs.employer_id = employers.id 
  ORDER BY jobs.created_at DESC`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Post a new job
router.post("/", verifyToken, (req, res) => {
  const { title, company, location, description, salary, type } = req.body;
const employer_id = req.employer ? req.employer.id : null;
const sql = "INSERT INTO jobs (title, company, location, description, salary, type, employer_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
db.query(sql, [title, company, location, description, salary, type, employer_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    // Send confirmation email
transporter.sendMail({
  from: "ramaitsane00@gmail.com",
  to: req.employer.email,
  subject: "Job Posted Successfully!",
  html: `
    <h2>Your job has been posted successfully!</h2>
    <p><strong>Job Title:</strong> ${title}</p>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Salary:</strong> ${salary}</p>
    <p><strong>Type:</strong> ${type}</p>
    <br/>
    <p>Thank you for using Job Portal!</p>
  `
}, (err, info) => {
  if (err) console.error("Email error:", err);
  else console.log("Email sent:", info.response);
});
res.json({ message: "Job posted successfully!", id: result.insertId });
  });
});

// Delete a job
  router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM jobs WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Job deleted successfully!" });
  });
});

// Edit a job
router.put("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, company, location, description } = req.body;
  const sql = "UPDATE jobs SET title = ?, company = ?, location = ?, description = ? WHERE id = ?";
  db.query(sql, [title, company, location, description, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Job updated successfully!" });
  });
});

module.exports = router;