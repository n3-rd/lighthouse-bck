import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import auditRoutes from "./routes/audit.js";
import path from "path";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use("/auth", authRoutes);
app.use("/audit", auditRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT) || 3933;
const host = process.env.HOST || "0.0.0.0";
app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
