import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import { sequelize } from "./config/database";
import cron from "node-cron";
import { Post } from "./models/Post";
import { Op } from "sequelize";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync();
    console.log("Database synchronized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();

// Schedule cron job to delete expired posts
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    await Post.destroy({
      where: {
        expires_at: {
          [Op.lt]: now,
        },
      },
    });
    console.log("Expired posts deleted successfully");
  } catch (error) {
    console.error("Error deleting expired posts:", error);
  }
});

export default app;
