import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const parseImages = (l) => ({ ...l, images: JSON.parse(l.images || '[]') });

function computeTrustScore(seller, soldCount) {
  let score = 0;
  if (seller.phone) score += 30;
  const monthsActive = Math.floor((Date.now() - new Date(seller.createdAt)) / (1000 * 60 * 60 * 24 * 30));
  score += Math.min(monthsActive * 4, 40);
  score += Math.min(soldCount * 6, 30);
  return Math.min(score, 100);
}

export const getPublicSeller = async (req, res) => {
  const seller = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, avatar: true, phone: true, createdAt: true },
  });
  if (!seller) return res.status(404).json({ error: 'Vânzătorul nu a fost găsit' });

  const [listings, soldCount] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: req.params.id, status: 'ACTIVE' },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { seller: { select: { id: true, name: true, phone: true, email: true } } },
    }),
    prisma.listing.count({ where: { sellerId: req.params.id, status: 'SOLD' } }),
  ]);

  const trustScore = computeTrustScore(seller, soldCount);

  res.json({ seller, listings: listings.map(parseImages), soldCount, trustScore });
};
