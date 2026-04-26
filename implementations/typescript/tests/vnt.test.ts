import { verifyVNT, createVNT } from '../src';
import validToken from '../../../test-vectors/valid-token.json';
import invalidSigToken from '../../../test-vectors/invalid-signature.json';
import tamperedToken from '../../../test-vectors/tampered-claim.json';

test('valid token passes verification', async () => {
  const result = await verifyVNT(validToken as any);
  expect(result.valid).toBe(true);
});

test('invalid signature fails', async () => {
  const result = await verifyVNT(invalidSigToken as any);
  expect(result.valid).toBe(false);
  expect(result.issues.some(i => i.includes('signature'))).toBe(true);
});

test('tampered claim fails content hash', async () => {
  const result = await verifyVNT(tamperedToken as any);
  expect(result.valid).toBe(false);
  expect(result.issues.some(i => i.includes('hash'))).toBe(true);
});

test('create and verify new token', async () => {
  const privateKey = new Uint8Array(32);
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
