import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  avatar: u.avatar,
  role: u.role,
  createdAt: u.createdAt,
});

export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email și parola sunt obligatorii' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Parola trebuie să aibă minim 6 caractere' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email-ul este deja folosit' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone: phone || null },
  });

  res.status(201).json({ token: signToken(user), user: safeUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email și parola sunt obligatorii' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Credențiale invalide' });
  }
  res.json({ token: signToken(user), user: safeUser(user) });
};

export const me = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(safeUser(user));
};

export const updateProfile = async (req, res) => {
  const { name, phone, avatar } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Numele este obligatoriu' });

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      ...(avatar !== undefined && { avatar: avatar || null }),
    },
  });
  res.json(safeUser(user));
};
