import { verifyVNT, createVNT } from '../src';

describe('VNT Tests', () => {
  const validToken: any = {
    "id": "https://veridium.io/vnt/tok_gold_example",
    "type": "VerifiableCredential",
    "credentialSubject": {
      "claim": {
        "subject": "Elebia EVO10 Hook",
        "predicate": "has maximum working load",
        "object": "10,000 kg"
      },
      "contentHash": "0xecf633e50d1a7483e126ba80ebce601e1da752ddee91c8a46ef0dd55ac469b3a"
    },
    "issuer": {
      "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      "name": "Veridium",
      "tier": "gold",
      "reputation": 5.0
    },
    "proof": {
      "type": "Ed25519Signature2020",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      "created": "2025-01-15T10:00:00Z",
      "proofValue": "z59FgMFEDyCcoWXN7BjYcTbzY45bztByMNXbbWrU7wLUBabZ86nRQBQgMNLjRpHN5hfwzL8jMLQUYKbgR7wTvi7pVpPz2PjysJXTMhM6eLq"
    },
    "signatureTimestamp": "2025-01-15T10:00:00Z",
    "verificationMethod": "human-expert",
    "verificationScore": 0.98,
    "expirationDate": "2026-01-15T10:00:00Z"
  };

  test('valid token passes verification', async () => {
    const result = await verifyVNT(validToken);
    expect(result.valid).toBe(true);
  });

  test('invalid signature fails', async () => {
    const invalidToken = JSON.parse(JSON.stringify(validToken));
    invalidToken.proof.proofValue = invalidToken.proof.proofValue.slice(0, -10) + 'InvalidSig';
    const result = await verifyVNT(invalidToken);
    expect(result.valid).toBe(false);
  });

  test('tampered claim fails content hash', async () => {
    const tamperedToken = JSON.parse(JSON.stringify(validToken));
    tamperedToken.credentialSubject.claim.object = "9,000 kg";
    const result = await verifyVNT(tamperedToken);
    expect(result.valid).toBe(false);
  });

  test('create and verify new token', async () => {
    const privateKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) privateKey[i] = i;
    
    const token = await createVNT({
      id: 'https://example.com/vnt/1',
      claim: { subject: 'test', predicate: 'is', object: 'ok' },
      issuerName: 'Test Issuer',
      issuerTier: 'bronze',
      verificationMethod: 'self-declared',
      verificationScore: 0.5,
      expirationDate: '2030-01-01T00:00:00Z',
      privateKey,
    });
    
    const result = await verifyVNT(token);
    expect(result.valid).toBe(true);
  });
});
