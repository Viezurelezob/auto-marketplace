import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const parseImages = (l) => ({ ...l, images: JSON.parse(l.images || '[]') });
const sellerSelect = { id: true, name: true, email: true, phone: true };

export const getAllListings = async (req, res) => {
  const { status, page = '1', limit = '20' } = req.query;
  const where = status ? { status } : {};
  const pageNum = Math.max(1, Number(page));
  const take = Math.min(100, Number(limit));
  const skip = (pageNum - 1) * take;

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { seller: { select: sellerSelect } },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({ listings: items.map(parseImages), total, page: pageNum, totalPages: Math.ceil(total / take) });
};

export const getAllUsers = async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  res.json(users);
};

export const setListingStatus = async (req, res) => {
  const { status } = req.body;
  if (!['ACTIVE', 'SOLD', 'DRAFT', 'PENDING'].includes(status)) {
    return res.status(400).json({ error: 'Status invalid' });
  }
  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: { status },
    include: { seller: { select: sellerSelect } },
  });
  res.json(parseImages(updated));
};

export const setListingPremium = async (req, res) => {
  const { isPremium, isFeatured } = req.body;
  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: {
      ...(isPremium !== undefined && { isPremium }),
      ...(isFeatured !== undefined && { isFeatured }),
    },
    include: { seller: { select: sellerSelect } },
  });
  res.json(parseImages(updated));
};

export const adminDeleteListing = async (req, res) => {
  await prisma.listing.delete({ where: { id: req.params.id } });
  res.json({ message: 'Anunț șters' });
};

export const getStats = async (_req, res) => {
  const [totalListings, totalUsers, activeListings, featuredListings, pendingListings] = await Promise.all([
    prisma.listing.count(),
    prisma.user.count(),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.listing.count({ where: { isFeatured: true } }),
    prisma.listing.count({ where: { status: 'PENDING' } }),
  ]);
  res.json({ totalListings, totalUsers, activeListings, featuredListings, pendingListings });
};
