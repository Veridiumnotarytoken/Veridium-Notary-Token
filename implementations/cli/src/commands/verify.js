const fs = require('fs');
const { verifyVNT } = require('@veridium/vnt');

module.exports = async function(file) {
  const tokenRaw = fs.readFileSync(file, 'utf8');
  const token = JSON.parse(tokenRaw);
  const result = await verifyVNT(token);
  console.log('Verification result:', result.valid ? '✅ VALID' : '❌ INVALID');
  console.log('Checks:', result.checks);
  if (result.issues.length) console.log('Issues:', result.issues);
  process.exit(result.valid ? 0 : 1);
};
