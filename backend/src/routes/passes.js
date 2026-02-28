const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Card = require('../models/card');
const { upsertPassObject, generateWalletJwt } = require('../services/googleWallet');

const router = express.Router();

// POST /api/passes/:cardId/generate
// Creates or updates the Google Wallet pass for a card and returns the JWT link
router.post('/:cardId/generate', requireAuth, async (req, res) => {
  const card = await Card.findByIdAndUser(Number(req.params.cardId), req.user.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  if (!process.env.GOOGLE_WALLET_ISSUER_ID) {
    return res.status(503).json({ error: 'Google Wallet not configured yet. See README for setup steps.' });
  }

  try {
    const passId = `card_${card.id}_user_${req.user.id}`;
    await upsertPassObject(card, passId);

    const passObjectId = `${process.env.GOOGLE_WALLET_ISSUER_ID}.${passId}`;
    await Card.update(card.id, { pass_object_id: passObjectId });

    const walletJwt = generateWalletJwt(passObjectId, card);
    const addToWalletUrl = `https://pay.google.com/gp/v/save/${walletJwt}`;

    res.json({ addToWalletUrl, passObjectId });
  } catch (err) {
    console.error('Google Wallet error:', err.message);
    res.status(500).json({ error: 'Failed to generate wallet pass', details: err.message });
  }
});

module.exports = router;
