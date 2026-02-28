const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Card = require('../models/card');
const { generateQR, generateQRSvg } = require('../services/qrCode');

const router = express.Router();

// GET /api/qr/:cardId — returns QR code as base64 PNG data URL
router.get('/:cardId', requireAuth, async (req, res) => {
  const card = await Card.findByIdAndUser(Number(req.params.cardId), req.user.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const shareUrl = `${process.env.FRONTEND_URL}/pages/card-view.html?id=${card.id}`;
  const qrDataUrl = await generateQR(shareUrl);
  res.json({ qrDataUrl, shareUrl });
});

// GET /api/qr/:cardId/svg — returns QR as inline SVG
router.get('/:cardId/svg', requireAuth, async (req, res) => {
  const card = await Card.findByIdAndUser(Number(req.params.cardId), req.user.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const shareUrl = `${process.env.FRONTEND_URL}/pages/card-view.html?id=${card.id}`;
  const svg = await generateQRSvg(shareUrl);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

module.exports = router;
