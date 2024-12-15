import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import userRouter from "./Routes/user.routes.js";
import todoRouter from "./Routes/todo.routes.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

const PORT = process.env.PORT;

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://your-production-domain.com"],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     credentials: true,
//   })

app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully!" });
});

app.use("/user", userRouter);
app.use("/todo", todoRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
