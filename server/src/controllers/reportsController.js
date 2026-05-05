import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createReport = async (req, res) => {
  const { reason } = req.body;
  const reporterId = req.user.id;
  const listingId = req.params.id;

  if (!reason?.trim()) return res.status(400).json({ error: 'Motivul este obligatoriu.' });

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Anunț negăsit.' });
  if (listing.sellerId === reporterId) return res.status(400).json({ error: 'Nu poți raporta propriul anunț.' });

  const existing = await prisma.report.findUnique({
    where: { reporterId_listingId: { reporterId, listingId } },
  });
  if (existing) return res.status(400).json({ error: 'Ai raportat deja acest anunț.' });

  await prisma.report.create({ data: { reporterId, listingId, reason } });
  res.json({ ok: true });
};

export const getReports = async (req, res) => {
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      listing:  { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json(reports);
};
