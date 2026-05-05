import { PrismaClient } from '@prisma/client';
import { getIo } from '../socket.js';
import { sendNewMessageEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

const listingSelect = { id: true, title: true, images: true, price: true, currency: true };
const userSelect   = { id: true, name: true };

const parseConv = (c) => ({
  ...c,
  listing: c.listing ? { ...c.listing, images: JSON.parse(c.listing.images || '[]') } : null,
});

export const getOrCreateConversation = async (req, res) => {
  const { listingId } = req.body;
  const buyerId = req.user.id;

  if (!listingId) return res.status(400).json({ error: 'listingId este obligatoriu' });

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Anunț negăsit' });
  if (listing.sellerId === buyerId) {
    return res.status(400).json({ error: 'Nu poți trimite mesaj propriului anunț' });
  }

  let conv = await prisma.conversation.findFirst({
    where: { listingId, buyerId, sellerId: listing.sellerId },
  });

  if (!conv) {
    conv = await prisma.conversation.create({
      data: { listingId, buyerId, sellerId: listing.sellerId },
    });
  }

  res.json(conv);
};

export const getMyConversations = async (req, res) => {
  const userId = req.user.id;

  const convs = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { select: listingSelect },
      buyer:  { select: userSelect },
      seller: { select: userSelect },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Count unread per conversation
  const unreadCounts = await prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      read: false,
      senderId: { not: userId },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
    _count: true,
  });

  const unreadMap = Object.fromEntries(unreadCounts.map((u) => [u.conversationId, u._count]));

  res.json(convs.map((c) => ({ ...parseConv(c), unreadCount: unreadMap[c.id] || 0 })));
};

export const getConversationById = async (req, res) => {
  const userId = req.user.id;

  const conv = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: {
      listing: { select: listingSelect },
      buyer:  { select: userSelect },
      seller: { select: userSelect },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: userSelect } },
      },
    },
  });

  if (!conv) return res.status(404).json({ error: 'Conversație negăsită' });
  if (conv.buyerId !== userId && conv.sellerId !== userId) {
    return res.status(403).json({ error: 'Acces interzis' });
  }

  // Mark all incoming messages as read
  await prisma.message.updateMany({
    where: { conversationId: conv.id, senderId: { not: userId }, read: false },
    data: { read: true },
  });

  // Notify sender in real-time that their messages were read
  getIo()?.to(`conv_${conv.id}`).emit('messages_read', { conversationId: conv.id, readBy: userId });

  res.json(parseConv(conv));
};

export const sendMessage = async (req, res) => {
  const userId = req.user.id;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ error: 'Mesajul nu poate fi gol' });

  const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conv) return res.status(404).json({ error: 'Conversație negăsită' });
  if (conv.buyerId !== userId && conv.sellerId !== userId) {
    return res.status(403).json({ error: 'Acces interzis' });
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conv.id, senderId: userId, content: content.trim() },
      include: { sender: { select: userSelect } },
    }),
    prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } }),
  ]);

  // Real-time delivery via Socket.io
  getIo()?.to(`conv_${conv.id}`).emit('new_message', message);

  // Email notification — fire-and-forget
  const recipientId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
  prisma.user.findUnique({
    where: { id: recipientId },
    select: { email: true, name: true },
  }).then((recipient) => {
    if (!recipient) return;
    const listing = prisma.listing.findUnique({ where: { id: conv.listingId }, select: { title: true } });
    return listing.then((l) => sendNewMessageEmail({
      toEmail: recipient.email,
      toName: recipient.name,
      fromName: message.sender.name,
      listingTitle: l?.title || 'anunț',
      previewText: content.trim().slice(0, 200),
      conversationId: conv.id,
    }));
  }).catch(() => {});

  res.status(201).json(message);
};

export const getUnreadCount = async (req, res) => {
  const userId = req.user.id;
  const count = await prisma.message.count({
    where: {
      read: false,
      senderId: { not: userId },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
  res.json({ count });
};
