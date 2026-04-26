const inquirer = require('inquirer');
const fs = require('fs');
const { createVNT } = require('@veridium/vnt');
const { generatePrivateKey, privateKeyToHex } = require('../utils/crypto');

module.exports = async function() {
  const answers = await inquirer.prompt([
    { name: 'id', message: 'Token ID (URL):', default: 'https://example.com/vnt/1' },
    { name: 'subject', message: 'Claim subject:' },
    { name: 'predicate', message: 'Claim predicate:' },
    { name: 'object', message: 'Claim object:' },
    { name: 'issuerName', message: 'Issuer name:' },
    { name: 'issuerTier', type: 'list', choices: ['gold','silver','bronze'] },
    { name: 'verificationMethod', type: 'list', choices: ['human-expert','ai-verified','self-declared'] },
    { name: 'verificationScore', type: 'number', default: 0.9 },
    { name: 'expirationDate', message: 'Expiration (YYYY-MM-DDTHH:MM:SSZ):', default: () => new Date(Date.now()+365*864e5).toISOString() },
  ]);
  
  const privateKey = generatePrivateKey();
  const token = await createVNT({
    id: answers.id,
    claim: { subject: answers.subject, predicate: answers.predicate, object: answers.object },
    issuerName: answers.issuerName,
    issuerTier: answers.issuerTier,
    verificationMethod: answers.verificationMethod,
    verificationScore: answers.verificationScore,
    expirationDate: answers.expirationDate,
    privateKey,
  });
  
  const outFile = `vnt-${Date.now()}.json`;
  fs.writeFileSync(outFile, JSON.stringify(token, null, 2));
  console.log(`Token issued and saved to ${outFile}`);
  console.log(`Private key (keep safe!): ${privateKeyToHex(privateKey)}`);
};
