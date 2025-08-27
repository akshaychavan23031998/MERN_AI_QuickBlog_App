import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import adminRouter from "./routes/adminRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

const app = express();

await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("API Is Working"));
app.use("/api/admin", adminRouter); // for login
app.use("/api/blog", blogRouter); // for Blogs

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Is running on Port", PORT);
});

export default app;
