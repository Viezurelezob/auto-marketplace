import rateLimit from 'express-rate-limit';

const json = (msg) => (_req, res) => res.status(429).json({ error: msg });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: json('Prea multe încercări. Încearcă din nou în 15 minute.'),
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  handler: json('Prea multe cereri. Încearcă din nou mai târziu.'),
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  handler: json('Prea multe upload-uri. Încearcă din nou în 1 oră.'),
  standardHeaders: true,
  legacyHeaders: false,
});
