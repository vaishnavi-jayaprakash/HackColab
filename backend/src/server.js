import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import teamRoutes from "./routes/team.routes.js";
import taskRoutes from "./routes/task.routes.js";
import deadlineRoutes from "./routes/deadline.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import conflictRoutes from "./routes/conflict.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HackColab API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api", teamRoutes);
app.use("/api", taskRoutes);
app.use("/api", deadlineRoutes);
app.use("/api", repositoryRoutes);
app.use("/api", conflictRoutes);
app.use("/api", uploadRoutes);
app.use("/api", submissionRoutes);
app.use("/api", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HackColab API running on port ${PORT}`);
});