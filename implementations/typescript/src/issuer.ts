import { ed25519 } from '@noble/ed25519';
import { sha3_256 } from 'js-sha3';
import canonicalize from 'canonicalize';
import { base58btc } from 'multibase';
import { VNT, Claim, Issuer, Proof } from './vnt';

function multibaseEncode(bytes: Uint8Array): string {
  return 'z' + base58btc.encode(bytes);
}

function multicodecEd25519Pubkey(pubKey: Uint8Array): Uint8Array {
  const prefix = new Uint8Array([0xed]);
  const result = new Uint8Array(prefix.length + pubKey.length);
  result.set(prefix);
  result.set(pubKey, prefix.length);
  return result;
}

function didFromPublicKey(pubKey: Uint8Array): string {
  const multicodec = multicodecEd25519Pubkey(pubKey);
  const encoded = multibaseEncode(multicodec);
  return `did:key:${encoded}`;
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
  
  const publicKey = await ed25519.getPublicKeyAsync(params.privateKey);
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
  const proofValue = multibaseEncode(signature);
  
  const proof: Proof = {
    type: 'Ed25519Signature2020',
    proofPurpose: 'assertionMethod',
    verificationMethod: did,
    created: new Date().toISOString(),
    proofValue,
  };
  
  return { ...unsignedToken, proof };
}
