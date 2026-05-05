import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMySearches = async (req, res) => {
  const searches = await prisma.savedSearch.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(searches.map((s) => ({ ...s, filters: JSON.parse(s.filters) })));
};

export const createSavedSearch = async (req, res) => {
  const { name, filters } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Numele alertei este obligatoriu.' });

  const count = await prisma.savedSearch.count({ where: { userId: req.user.id } });
  if (count >= 10) return res.status(400).json({ error: 'Poți salva maxim 10 alerte de căutare.' });

  const search = await prisma.savedSearch.create({
    data: {
      userId: req.user.id,
      name: name.trim(),
      filters: JSON.stringify(filters || {}),
    },
  });
  res.status(201).json({ ...search, filters: JSON.parse(search.filters) });
};

export const deleteSavedSearch = async (req, res) => {
  const search = await prisma.savedSearch.findUnique({ where: { id: req.params.id } });
  if (!search) return res.status(404).json({ error: 'Alerta nu a fost găsită.' });
  if (search.userId !== req.user.id) return res.status(403).json({ error: 'Acces interzis.' });

  await prisma.savedSearch.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
};
