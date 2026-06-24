import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";


// Route imports
import authRouter from "./routes/auth.routes.js";
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());


// Routes
app.use("/api/v1/auth", authRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});



export { app };
