import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import botApiRouter from "./routes/botApi.js";
import multer from "multer";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());

app.use("/botApi", botApiRouter);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      console.error("File size exceeds 5 MB");
      return res.status(400).json({
        status: "error",
        errorType: "File size exceeds 5 MB",
      });
    }
  }

  return res.status(500).json({ status: "error", errorType: err.message });
});

export default app;
