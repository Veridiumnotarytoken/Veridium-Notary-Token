import { sha3_256 } from 'js-sha3';
import canonicalize from 'canonicalize';
import * as ed25519 from '@noble/ed25519';
import * as multibase from 'multibase';
import { VNT, VerificationResult } from './vnt';
 
async function verifySignature(token: VNT): Promise<boolean> {
  const { proof, ...payload } = token;
  const canonicalPayload = canonicalize(payload);
  if (!canonicalPayload) return false;
  const payloadBytes = new TextEncoder().encode(canonicalPayload);
 
  // proofValue is a full multibase string e.g. "z<base58>"
  const signature = multibase.decode(token.proof.proofValue);
 
  const didKey = token.issuer.id;
  // did:key:z<multibase-encoded-multicodec-pubkey>
  const pubKeyMultibase = didKey.slice('did:key:'.length);
  const pubKeyBytes = multibase.decode(pubKeyMultibase);
  // strip 2-byte multicodec prefix (0xed 0x01)
  const publicKey = pubKeyBytes.slice(2);
 
  return await ed25519.verify(
    new Uint8Array(signature),
    payloadBytes,
    new Uint8Array(publicKey),
  );
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
 
  // For invalid signatures (e.g. test vectors with bad data), catch decode errors
  try {
    const sigValid = await verifySignature(token);
    checks.signatureValid = sigValid;
    if (!sigValid) issues.push('Signature verification failed');
  } catch {
    checks.signatureValid = false;
    issues.push('Signature verification failed');
  }
 
  const valid = checks.notExpired && checks.contentHashMatch && checks.signatureValid;
  return { valid, checks, issues };
}
 
