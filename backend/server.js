import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDb from "./config/db.js";
const app = express();
import adminRouter from "./routes/adminRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

await connectDb();

const PORT = process.env.PORT || 3000;

//middlewares
app.use(cors());
app.use(express.json());

//Mounting the routes
app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);

app.get("/", (req, res) => {
  res.send("API is Working");
});

app.listen(PORT, () => {
  console.log(`app is running on port no http://localhost:${PORT}`);
});

export default app;