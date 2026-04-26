const fs = require('fs');
const { createVNT } = require('@veridium/vnt');
const { getPrivateKeyFromFile } = require('../utils/crypto');

module.exports = async function(claimFile, options) {
  const claim = JSON.parse(fs.readFileSync(claimFile, 'utf8'));
  const privateKey = getPrivateKeyFromFile(options.key);
  console.error('Please use interactive `vnt issue` for full metadata. This is a stub.');
};
