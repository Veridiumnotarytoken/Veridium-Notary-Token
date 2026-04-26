import { sha3_256 } from 'js-sha3';
import canonicalize from 'canonicalize';
import { ed25519 } from '@noble/ed25519';
import { base58btc } from 'multibase';
import { VNT, VerificationResult } from './vnt';

async function verifySignature(token: VNT): Promise<boolean> {
  const { proof, ...payload } = token;
  const canonicalPayload = canonicalize(payload);
  if (!canonicalPayload) return false;
  const payloadBytes = new TextEncoder().encode(canonicalPayload);
  
  const proofValueB58 = token.proof.proofValue.slice(1);
  const signature = base58btc.decode(`z${proofValueB58}`);
  
  const didKey = token.issuer.id;
  const pubKeyMultibase = didKey.slice('did:key:'.length);
  const pubKeyBytes = base58btc.decode(pubKeyMultibase);
  const publicKey = pubKeyBytes.slice(2);
  
  return await ed25519.verify(signature, payloadBytes, publicKey);
}

function recomputeContentHash(claim: any): string {
  const canonicalClaim = canonicalize(claim);
  if (!canonicalClaim) throw new Error('Cannot canonicalize claim');
  const hash = sha3_256.create();
  hash.update(canonicalClaim);
  return '0x' + hash.hex();
}

export async function verifyVNT(token: VNT): Promise<VerificationResult> {
  const issues: string[] = [];
  const checks = {
    schemaValid: true,
    notExpired: true,
    contentHashMatch: true,
    signatureValid: false,
  };
  
  const now = new Date();
  const expiry = new Date(token.expirationDate);
  if (expiry < now) {
    checks.notExpired = false;
    issues.push('Token has expired');
  }
  
  const expectedHash = recomputeContentHash(token.credentialSubject.claim);
  if (expectedHash !== token.credentialSubject.contentHash) {
    checks.contentHashMatch = false;
    issues.push('Content hash does not match claim');
  }
  
  const sigValid = await verifySignature(token);
  checks.signatureValid = sigValid;
  if (!sigValid) issues.push('Signature verification failed');
  
  const valid = checks.notExpired && checks.contentHashMatch && checks.signatureValid;
  return { valid, checks, issues };
}
