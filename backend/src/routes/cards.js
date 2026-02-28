const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Card = require('../models/card');

const router = express.Router();

// GET /api/cards
router.get('/', requireAuth, async (req, res) => {
  const cards = await Card.findAllByUser(req.user.id);
  res.json({ cards });
});

// GET /api/cards/:id
router.get('/:id', requireAuth, async (req, res) => {
  const card = await Card.findByIdAndUser(Number(req.params.id), req.user.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  res.json({ card });
});

// POST /api/cards
router.post('/', requireAuth, async (req, res) => {
  const { type, name, title, company, email, phone, website, color, stamps_total } = req.body;
  if (!type || !name) return res.status(400).json({ error: 'type and name are required' });
  if (!['business', 'loyalty'].includes(type)) return res.status(400).json({ error: 'type must be business or loyalty' });

  const card = await Card.create({ userId: req.user.id, type, name, title, company, email, phone, website, color, stamps_total });
  res.status(201).json({ card });
});

// PATCH /api/cards/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const existing = await Card.findByIdAndUser(Number(req.params.id), req.user.id);
  if (!existing) return res.status(404).json({ error: 'Card not found' });

  const card = await Card.update(Number(req.params.id), req.body);
  res.json({ card });
});

// POST /api/cards/:id/logo
router.post('/:id/logo', requireAuth, upload.single('logo'), async (req, res) => {
  const existing = await Card.findByIdAndUser(Number(req.params.id), req.user.id);
  if (!existing) return res.status(404).json({ error: 'Card not found' });

  const card = await Card.update(Number(req.params.id), { logo_url: `/uploads/${req.file.filename}` });
  res.json({ card });
});

// POST /api/cards/:id/photo
router.post('/:id/photo', requireAuth, upload.single('photo'), async (req, res) => {
  const existing = await Card.findByIdAndUser(Number(req.params.id), req.user.id);
  if (!existing) return res.status(404).json({ error: 'Card not found' });

  const card = await Card.update(Number(req.params.id), { photo_url: `/uploads/${req.file.filename}` });
  res.json({ card });
});

// DELETE /api/cards/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const existing = await Card.findByIdAndUser(Number(req.params.id), req.user.id);
  if (!existing) return res.status(404).json({ error: 'Card not found' });

  await Card.delete(Number(req.params.id), req.user.id);
  res.json({ success: true });
});

// GET /api/cards/:id/public — no auth, used by QR code share page
router.get('/:id/public', async (req, res) => {
  const card = await Card.findById(Number(req.params.id));
  if (!card) return res.status(404).json({ error: 'Card not found' });
  // Strip internal fields before sending publicly
  const { pass_object_id, user_id, ...pub } = card;
  res.json({ card: pub });
});

module.exports = router;
