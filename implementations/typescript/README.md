# @veridium/vnt – TypeScript library

Install: `npm install @veridium/vnt`

## Usage

```typescript
import { verifyVNT, createVNT } from '@veridium/vnt';

const token = JSON.parse(fs.readFileSync('token.json', 'utf8'));
const result = await verifyVNT(token);
console.log(result.valid ? 'Valid token' : 'Invalid');

const privateKey = crypto.getRandomValues(new Uint8Array(32));
const newToken = await createVNT({
  id: 'https://my.org/vnt/abc',
  claim: { subject: 'Steel bar', predicate: 'has tensile strength', object: '500 MPa' },
  issuerName: 'MyOrg',
  issuerTier: 'silver',
  verificationMethod: 'ai-verified',
  verificationScore: 0.92,
  expirationDate: '2025-12-31T23:59:59Z',
  privateKey,
});
```

## API

- `verifyVNT(token: VNT): Promise<VerificationResult>` – performs offline checks.
- `createVNT(params): Promise<VNT>` – signs a claim using an Ed25519 private key.
