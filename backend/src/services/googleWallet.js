const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// NOTE: Set GOOGLE_WALLET_ISSUER_ID and GOOGLE_APPLICATION_CREDENTIALS in your .env
const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const BASE_URL = 'https://walletobjects.googleapis.com/walletobjects/v1';

async function getAuthClient() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/wallet_object.issuer',
  });
  return auth.getClient();
}

// Build a Generic Pass object (works for both business card & loyalty)
function buildPassObject(card, passId) {
  const isLoyalty = card.type === 'loyalty';

  const obj = {
    id: `${ISSUER_ID}.${passId}`,
    classId: `${ISSUER_ID}.${isLoyalty ? 'loyalty_class' : 'business_class'}`,
    genericType: isLoyalty ? 'GENERIC_TYPE_UNSPECIFIED' : 'GENERIC_TYPE_UNSPECIFIED',
    hexBackgroundColor: card.color || '#1a73e8',
    logo: card.logo_url
      ? { sourceUri: { uri: `${process.env.API_BASE_URL}${card.logo_url}` } }
      : undefined,
    cardTitle: {
      defaultValue: { language: 'en-US', value: card.company || card.name },
    },
    subheader: {
      defaultValue: { language: 'en-US', value: card.title || '' },
    },
    header: {
      defaultValue: { language: 'en-US', value: card.name },
    },
    textModulesData: [
      card.email   && { id: 'email',   header: 'Email',   body: card.email },
      card.phone   && { id: 'phone',   header: 'Phone',   body: card.phone },
      card.website && { id: 'website', header: 'Website', body: card.website },
      isLoyalty    && { id: 'stamps',  header: 'Stamps',  body: `${card.stamps_current || 0} / ${card.stamps_total || 10}` },
    ].filter(Boolean),
    heroImage: card.photo_url
      ? { sourceUri: { uri: `${process.env.API_BASE_URL}${card.photo_url}` } }
      : undefined,
  };

  return obj;
}

// Create or update a pass object in Google Wallet
async function upsertPassObject(card, passId) {
  const client = await getAuthClient();
  const passObject = buildPassObject(card, passId);
  const url = `${BASE_URL}/genericObject/${ISSUER_ID}.${passId}`;

  try {
    // Try to GET first — update if exists, create if not
    await client.request({ url, method: 'GET' });
    await client.request({ url, method: 'PUT', data: passObject });
  } catch (err) {
    if (err.status === 404) {
      await client.request({
        url: `${BASE_URL}/genericObject`,
        method: 'POST',
        data: passObject,
      });
    } else {
      throw err;
    }
  }

  return passObject;
}

// Generate a signed JWT for the "Add to Google Wallet" button
function generateWalletJwt(passObjectId, card) {
  const passId = passObjectId.split('.').pop();
  const passObject = buildPassObject(card, passId);

  const claims = {
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    aud: 'google',
    typ: 'savetowallet',
    payload: {
      genericObjects: [passObject],
    },
  };

  // Sign with the service account private key
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n');
  return jwt.sign(claims, privateKey, { algorithm: 'RS256' });
}

module.exports = { upsertPassObject, generateWalletJwt };
