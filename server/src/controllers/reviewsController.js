import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSellerReviews = async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { sellerId: req.params.id },
    include: { reviewer: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  res.json({ reviews, avgRating, count: reviews.length });
};

export const createReview = async (req, res) => {
  const reviewerId = req.user.id;
  const sellerId = req.params.id;
  const { rating, comment } = req.body;

  if (reviewerId === sellerId) {
    return res.status(400).json({ error: 'Nu poți recenza propriul profil.' });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating invalid (1–5).' });
  }

  const existing = await prisma.review.findUnique({
    where: { reviewerId_sellerId: { reviewerId, sellerId } },
  });
  if (existing) {
    return res.status(400).json({ error: 'Ai lăsat deja o recenzie pentru acest vânzător.' });
  }

  const review = await prisma.review.create({
    data: { reviewerId, sellerId, rating, comment: comment?.trim() || null },
    include: { reviewer: { select: { id: true, name: true, avatar: true } } },
  });

  res.status(201).json(review);
};
