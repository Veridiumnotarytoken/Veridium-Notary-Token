const { ed25519 } = require('@noble/ed25519');
const crypto = require('crypto');

async function getPrivateKeyFromFile(file) {
  const hex = fs.readFileSync(file, 'utf8').trim();
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

function generatePrivateKey() {
  return ed25519.utils.randomPrivateKey();
}

function privateKeyToHex(privateKey) {
  return Buffer.from(privateKey).toString('hex');
}

module.exports = { getPrivateKeyFromFile, generatePrivateKey, privateKeyToHex };
