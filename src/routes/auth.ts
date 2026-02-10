import { Router, type Request, type Response } from "express";
import { randomBytes } from "node:crypto";
import { prisma } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router: Router = Router();
const TOKEN_TTL_MS = 1000 * 60 * 30; // 30 min for magic link
const INITIAL_CREDITS = 20;
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

type SignupBody = { name?: string; email?: string };
type LoginBody = { email?: string };

function toLoginLink(token: string): string {
  return `${BASE_URL}/auth/verify?token=${token}`;
}

// POST /auth/signup — name + email, create user with 20 credits
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const body = req.body as SignupBody;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name || !email) {
    res.status(400).json({ error: "name and email required" });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const user = await prisma.user.create({
    data: { name, email, credits: INITIAL_CREDITS },
    select: { id: true, name: true, email: true, credits: true, createdAt: true },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: INITIAL_CREDITS,
      reason: "signup_bonus",
      balanceAfter: INITIAL_CREDITS,
    },
  });
  const token = randomBytes(32).toString("hex");
  await prisma.loginToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  const loginLink = toLoginLink(token);
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
    loginLink, // in dev use this to "log in" without email
  });
});

// POST /auth/login — email only, magic link (we return link in body for dev)
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const body = req.body as LoginBody;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    res.status(400).json({ error: "email required" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ error: "No account with this email" });
    return;
  }
  const token = randomBytes(32).toString("hex");
  await prisma.loginToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  const loginLink = toLoginLink(token);
  res.json({ loginLink, message: "Use the link to sign in (or check your email when configured)" });
});

// GET /auth/verify?token=xxx — magic link callback, set cookie
router.get("/verify", async (req: Request, res: Response): Promise<void> => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    res.status(400).json({ error: "token required" });
    return;
  }
  const record = await prisma.loginToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) {
    await prisma.loginToken.deleteMany({ where: { token } }).catch(() => { });
    res.status(400).json({ error: "Invalid or expired link" });
    return;
  }
  await prisma.loginToken.delete({ where: { id: record.id } });
  const jwtToken = signToken({ sub: record.user.id, email: record.user.email });
  res.cookie("auth", jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
    path: "/",
  });
  const user = {
    id: record.user.id,
    name: record.user.name,
    email: record.user.email,
    credits: record.user.credits,
    createdAt: record.user.createdAt,
  };
  res.json({ user, message: "Signed in" });
});

// GET /auth/me — current user (requires cookie)
router.get("/me", requireAuth, (req: Request, res: Response): void => {
  res.json({ user: (req as Request & { user: { id: string; name: string; email: string; credits: number; createdAt: Date } }).user });
});

// POST /auth/logout
router.post("/logout", (_req: Request, res: Response): void => {
  res.clearCookie("auth", { path: "/" });
  res.json({ message: "Signed out" });
});

export default router;
