const express = require("express");
const cors = require("cors");
const jobRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors({
  origin: "https://sajobs-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "authorization"]
}));
app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});