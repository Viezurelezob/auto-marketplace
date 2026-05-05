import { PrismaClient } from '@prisma/client';
import { sendSavedSearchAlert, sendExpiryWarningEmail, sendListingExpiredEmail } from './emailService.js';

const prisma = new PrismaClient();
const parseImages = (l) => ({ ...l, images: JSON.parse(l.images || '[]') });

function buildWhere(filters) {
  const where = { status: 'ACTIVE' };
  if (filters.brand)    where.brand    = { contains: filters.brand };
  if (filters.model)    where.model    = { contains: filters.model };
  if (filters.fuelType) where.fuelType = filters.fuelType;
  if (filters.transmission) where.transmission = filters.transmission;
  if (filters.bodyType) where.bodyType = filters.bodyType;
  if (filters.location) where.location = { contains: filters.location };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = Number(filters.minPrice);
    if (filters.maxPrice) where.price.lte = Number(filters.maxPrice);
  }
  if (filters.minYear || filters.maxYear) {
    where.year = {};
    if (filters.minYear) where.year.gte = Number(filters.minYear);
    if (filters.maxYear) where.year.lte = Number(filters.maxYear);
  }
  if (filters.maxMileage) where.mileage = { lte: Number(filters.maxMileage) };
  return where;
}

async function checkListingExpiry() {
  try {
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Warn listings expiring within 7 days (only once)
    const expiringSoon = await prisma.listing.findMany({
      where: { status: 'ACTIVE', expiresAt: { lte: in7days, gt: now }, expiryWarningSent: false },
      include: { seller: { select: { email: true, name: true } } },
    });
    for (const l of expiringSoon) {
      const daysLeft = Math.max(1, Math.ceil((new Date(l.expiresAt) - now) / (1000 * 60 * 60 * 24)));
      await sendExpiryWarningEmail({ toEmail: l.seller.email, toName: l.seller.name, listingTitle: l.title, daysLeft }).catch(() => {});
      await prisma.listing.update({ where: { id: l.id }, data: { expiryWarningSent: true } });
    }

    // Expire overdue listings
    const expired = await prisma.listing.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: now } },
      include: { seller: { select: { email: true, name: true } } },
    });
    for (const l of expired) {
      await prisma.listing.update({ where: { id: l.id }, data: { status: 'DRAFT' } });
      await sendListingExpiredEmail({ toEmail: l.seller.email, toName: l.seller.name, listingTitle: l.title }).catch(() => {});
    }

    if (expiringSoon.length + expired.length > 0) {
      console.log(`[alerts] Expiry: ${expiringSoon.length} warned, ${expired.length} expired`);
    }
  } catch (err) {
    console.error('[alerts] Expiry check error:', err.message);
  }
}

async function runAlertsCheck() {
  await checkListingExpiry();
  try {
    const searches = await prisma.savedSearch.findMany({
      include: { user: { select: { email: true, name: true } } },
    });

    for (const search of searches) {
      let filters;
      try { filters = JSON.parse(search.filters); } catch { filters = {}; }

      const where = { ...buildWhere(filters), createdAt: { gt: search.lastCheckedAt } };
      const newListings = await prisma.listing.findMany({ where, take: 5, orderBy: { createdAt: 'desc' } });

      if (newListings.length > 0) {
        await sendSavedSearchAlert({
          toEmail: search.user.email,
          toName: search.user.name,
          searchName: search.name,
          listings: newListings.map(parseImages),
        }).catch(() => {});
      }

      await prisma.savedSearch.update({
        where: { id: search.id },
        data: { lastCheckedAt: new Date() },
      });
    }
  } catch (err) {
    console.error('[alerts] Error:', err.message);
  }
}

export function startAlertsJob() {
  const ONE_HOUR = 60 * 60 * 1000;
  setTimeout(runAlertsCheck, 5000); // first check 5s after boot
  setInterval(runAlertsCheck, ONE_HOUR);
  console.log('[alerts] Job started — checking every hour');
}
