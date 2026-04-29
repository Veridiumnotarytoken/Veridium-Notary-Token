import * as ed25519 from '@noble/ed25519';
import { sha3_256 } from 'js-sha3';
import canonicalize from 'canonicalize';
import * as multibase from 'multibase';
import { VNT, Claim, Issuer, Proof } from './vnt';
 
// multibase.encode returns a Uint8Array of ASCII bytes (including the prefix char).
// Convert to a proper string via Buffer.from(...).toString().
function multibaseEncodeBase58btc(bytes: Uint8Array): string {
  return Buffer.from(multibase.encode('base58btc', Buffer.from(bytes))).toString();
  // returns the full multibase string, e.g. "z6Mk..."
}
 
function multicodecEd25519Pubkey(pubKey: Uint8Array): Uint8Array {
  // ed25519-pub multicodec prefix: 0xed 0x01
  const prefix = new Uint8Array([0xed, 0x01]);
  const result = new Uint8Array(prefix.length + pubKey.length);
  result.set(prefix);
  result.set(pubKey, prefix.length);
  return result;
}
 
function didFromPublicKey(pubKey: Uint8Array): string {
  const multicodec = multicodecEd25519Pubkey(pubKey);
  return `did:key:${multibaseEncodeBase58btc(multicodec)}`;
}
 
export async function createVNT(params: {
  id: string;
  claim: Claim;
  issuerName: string;
  issuerTier: 'gold' | 'silver' | 'bronze' | 'founding';
  verificationMethod: 'human-expert' | 'ai-verified' | 'self-declared';
  verificationScore: number;
  expirationDate: string;
  privateKey: Uint8Array;
}): Promise<VNT> {
  const canonicalClaim = canonicalize(params.claim);
  if (!canonicalClaim) throw new Error('Failed to canonicalize claim');
  const contentHash = '0x' + sha3_256(canonicalClaim);
 
  const publicKey = await ed25519.getPublicKey(params.privateKey);
  const did = didFromPublicKey(publicKey);
 
  const issuer: Issuer = {
    id: did,
    name: params.issuerName,
    tier: params.issuerTier,
  };
 
  const unsignedToken: Omit<VNT, 'proof'> = {
    id: params.id,
    type: 'VerifiableCredential',
    credentialSubject: {
      claim: params.claim,
      contentHash,
    },
    issuer,
    signatureTimestamp: new Date().toISOString(),
    verificationMethod: params.verificationMethod,
    verificationScore: params.verificationScore,
    expirationDate: params.expirationDate,
  };
 
  const canonicalPayload = canonicalize(unsignedToken);
  if (!canonicalPayload) throw new Error('Failed to canonicalize unsigned token');
  const payloadBytes = new TextEncoder().encode(canonicalPayload);
  const signature = await ed25519.sign(payloadBytes, params.privateKey);
  const proofValue = multibaseEncodeBase58btc(signature); // e.g. "z..."
 
  const proof: Proof = {
    type: 'Ed25519Signature2020',
    proofPurpose: 'assertionMethod',
    verificationMethod: did,
    created: new Date().toISOString(),
    proofValue,
  };
 
  return { ...unsignedToken, proof };
}
 
