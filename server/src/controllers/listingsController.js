import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const parseImages = (l) => ({ ...l, images: JSON.parse(l.images || '[]') });
const sellerSelect = { id: true, name: true, phone: true, email: true };

export const getListings = async (req, res) => {
  const {
    brand, model, fuelType, transmission, bodyType, location,
    driveType, emissionStandard, origin, doors, seats,
    minPrice, maxPrice, minYear, maxYear, maxMileage, minPower, maxPower,
    isNegotiable, featured, status = 'ACTIVE',
    sort = 'newest', page = '1', limit = '12',
  } = req.query;

  const where = { status };

  if (brand)           where.brand        = { contains: brand };
  if (model)           where.model        = { contains: model };
  if (fuelType)        where.fuelType     = fuelType;
  if (transmission)    where.transmission = transmission;
  if (bodyType)        where.bodyType     = bodyType;
  if (location)        where.location     = { contains: location };
  if (driveType)       where.driveType    = driveType;
  if (emissionStandard) where.emissionStandard = emissionStandard;
  if (origin)          where.origin       = origin;
  if (doors)           where.doors        = Number(doors);
  if (seats)           where.seats        = { gte: Number(seats) };
  if (featured === 'true') where.isFeatured = true;
  if (isNegotiable === 'true') where.isNegotiable = true;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (minYear || maxYear) {
    where.year = {};
    if (minYear) where.year.gte = Number(minYear);
    if (maxYear) where.year.lte = Number(maxYear);
  }
  if (maxMileage) where.mileage = { lte: Number(maxMileage) };
  if (minPower || maxPower) {
    where.powerHp = {};
    if (minPower) where.powerHp.gte = Number(minPower);
    if (maxPower) where.powerHp.lte = Number(maxPower);
  }

  const sortMap = {
    newest:     { createdAt: 'desc' },
    oldest:     { createdAt: 'asc' },
    priceAsc:   { price: 'asc' },
    priceDesc:  { price: 'desc' },
    mileageAsc: { mileage: 'asc' },
    viewsDesc:  { views: 'desc' },
  };
  const orderBy = sortMap[sort] || { createdAt: 'desc' };

  const pageNum = Math.max(1, Number(page));
  const take    = Math.min(50, Math.max(1, Number(limit)));
  const skip    = (pageNum - 1) * take;

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where, orderBy, skip, take,
      include: { seller: { select: sellerSelect } },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({ listings: items.map(parseImages), total, page: pageNum, totalPages: Math.ceil(total / take) });
};

export const getListingById = async (req, res) => {
  const listing = await prisma.listing.findUnique({
    where: { id: req.params.id },
    include: { seller: { select: sellerSelect } },
  });
  if (!listing) return res.status(404).json({ error: 'Anunțul nu a fost găsit' });

  // Increment views (fire-and-forget)
  prisma.listing.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } }).catch(() => {});

  res.json(parseImages(listing));
};

export const createListing = async (req, res) => {
  const {
    title, brand, model, year, price, currency = 'RON',
    mileage, fuelType, transmission, engineSize, powerHp,
    bodyType, color, vin, location, description, images = [],
    driveType, doors, seats, emissionStandard, isNegotiable = false, origin,
  } = req.body;

  if (!title || !brand || !model || !year || !price || !mileage || !fuelType || !transmission || !location || !description) {
    return res.status(400).json({ error: 'Completați toate câmpurile obligatorii' });
  }

  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const numPrice = Number(price);
  const numCurrency = currency || 'RON';

  const listing = await prisma.listing.create({
    data: {
      title, brand, model, year: Number(year), price: numPrice, currency: numCurrency,
      mileage: Number(mileage), fuelType, transmission,
      engineSize: engineSize ? Number(engineSize) : null,
      powerHp:   powerHp   ? Number(powerHp)   : null,
      doors:     doors     ? Number(doors)     : null,
      seats:     seats     ? Number(seats)     : null,
      bodyType: bodyType || null, color: color || null, vin: vin || null,
      location, description,
      images: JSON.stringify(Array.isArray(images) ? images : []),
      driveType: driveType || null,
      emissionStandard: emissionStandard || null,
      isNegotiable: Boolean(isNegotiable),
      origin: origin || null,
      sellerId: req.user.id,
      status: 'PENDING',
      expiresAt,
    },
    include: { seller: { select: sellerSelect } },
  });

  // Save initial price to history
  await prisma.priceHistory.create({ data: { listingId: listing.id, price: numPrice, currency: numCurrency } }).catch(() => {});

  res.status(201).json(parseImages(listing));
};

export const updateListing = async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Anunțul nu a fost găsit' });
  if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Nu ești autorizat să editezi acest anunț' });
  }

  const { images, year, price, mileage, engineSize, powerHp, doors, seats, isNegotiable, currency, ...rest } = req.body;

  const priceChanged = price !== undefined && Number(price) !== listing.price;

  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(currency    !== undefined && { currency }),
      ...(year        !== undefined && { year:        Number(year) }),
      ...(price       !== undefined && { price:       Number(price) }),
      ...(mileage     !== undefined && { mileage:     Number(mileage) }),
      ...(engineSize  !== undefined && { engineSize:  engineSize  ? Number(engineSize)  : null }),
      ...(powerHp     !== undefined && { powerHp:     powerHp     ? Number(powerHp)     : null }),
      ...(doors       !== undefined && { doors:       doors       ? Number(doors)       : null }),
      ...(seats       !== undefined && { seats:       seats       ? Number(seats)       : null }),
      ...(isNegotiable !== undefined && { isNegotiable: Boolean(isNegotiable) }),
      ...(images      !== undefined && { images:      JSON.stringify(Array.isArray(images) ? images : []) }),
    },
    include: { seller: { select: sellerSelect } },
  });

  // Record price change in history
  if (priceChanged) {
    const newCurrency = currency || listing.currency;
    prisma.priceHistory.create({ data: { listingId: listing.id, price: Number(price), currency: newCurrency } }).catch(() => {});
  }

  res.json(parseImages(updated));
};

export const deleteListing = async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Anunțul nu a fost găsit' });
  if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Nu ești autorizat să ștergi acest anunț' });
  }
  await prisma.listing.delete({ where: { id: req.params.id } });
  res.json({ message: 'Anunț șters cu succes' });
};

export const markSold = async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Anunțul nu a fost găsit' });
  if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Nu ești autorizat' });
  }
  const updated = await prisma.listing.update({
    where: { id: req.params.id }, data: { status: 'SOLD' },
    include: { seller: { select: sellerSelect } },
  });
  res.json(parseImages(updated));
};

export const promoteListing = async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Anunțul nu a fost găsit' });
  if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Nu ești autorizat' });
  }
  const updated = await prisma.listing.update({
    where: { id: req.params.id }, data: { isFeatured: true, isPremium: true },
    include: { seller: { select: sellerSelect } },
  });
  res.json(parseImages(updated));
};

export const getRelated = async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Anunțul nu a fost găsit' });

  const items = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      status: 'ACTIVE',
      OR: [
        { brand: listing.brand },
        ...(listing.bodyType ? [{ bodyType: listing.bodyType }] : []),
      ],
    },
    orderBy: { isFeatured: 'desc' },
    take: 4,
    include: { seller: { select: sellerSelect } },
  });

  res.json(items.map(parseImages));
};

export const renewListing = async (req, res) => {
  const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
  if (!listing) return res.status(404).json({ error: 'Anunțul nu a fost găsit' });
  if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Nu ești autorizat' });
  }
  const updated = await prisma.listing.update({
    where: { id: req.params.id },
    data: {
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      expiryWarningSent: false,
      status: 'ACTIVE',
    },
    include: { seller: { select: sellerSelect } },
  });
  res.json(parseImages(updated));
};

export const getPriceHistory = async (req, res) => {
  const history = await prisma.priceHistory.findMany({
    where: { listingId: req.params.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json(history);
};

export const getMyListings = async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: sellerSelect },
      _count: { select: { favorites: true, conversations: true } },
    },
  });
  res.json(listings.map(parseImages));
};
