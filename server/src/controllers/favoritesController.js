import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const parseImages = (l) => ({ ...l, images: JSON.parse(l.images || '[]') });

export const toggleFavorite = async (req, res) => {
  const userId = req.user.id;
  const { listingId } = req.params;

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Anunț negăsit' });

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { userId_listingId: { userId, listingId } } });
    return res.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, listingId } });
  res.json({ favorited: true });
};

export const getFavoriteIds = async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    select: { listingId: true },
  });
  res.json(favorites.map((f) => f.listingId));
};

export const getFavoriteListings = async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id },
    include: {
      listing: {
        include: { seller: { select: { id: true, name: true, phone: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    favorites
      .filter((f) => f.listing)
      .map((f) => ({ ...parseImages(f.listing), favoritedAt: f.createdAt }))
  );
};
