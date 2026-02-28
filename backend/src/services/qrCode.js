const QRCode = require('qrcode');

// Returns a base64 data URL of the QR code
async function generateQR(url) {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

// Returns the QR as an SVG string
async function generateQRSvg(url) {
  return QRCode.toString(url, { type: 'svg' });
}

module.exports = { generateQR, generateQRSvg };
