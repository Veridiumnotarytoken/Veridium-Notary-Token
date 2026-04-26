# Veridium Notary Token (VNT) Specification – Version 1.0

**Status:** Stable  
**Publication date:** 2025-01-15  
**License:** CC0-1.0 (Public Domain)

## 1. Abstract

The Veridium Notary Token (VNT) defines a self‑contained, cryptographically verifiable JSON document that attests to a factual claim (`subject – predicate – object`). It uses SHA3‑256 for content integrity, Ed25519 signatures, and JCS (RFC 8785) for deterministic JSON serialisation. VNTs can be verified offline without any external API, and they support three distinct trust tiers (Gold, Silver, Bronze). Optional blockchain anchoring (EVM, Merkle Mountain Range) provides long‑term notarisation.

## 2. Introduction

In many supply chain, compliance, and certification scenarios, participants need to share signed claims that third parties can verify without contacting the issuer. Current solutions either rely on centralised registries or use complex cryptographic schemes. VNT bridges this gap with a minimal JSON format, well‑understood cryptography, and explicit trust scoring.

## 3. Terminology

- **Claim:** A triple (subject, predicate, object) representing a factual statement.
- **Content Hash:** SHA3‑256 of the canonicalised claim JSON object.
- **VNT:** The complete token containing claim, issuer information, proof, and metadata.
- **DID:key:** Decentralised identifier format `did:key:...` derived from an Ed25519 public key (Multibase base58‑btc encoding with prefix `0xED`).
- **JCS:** JSON Canonicalisation Scheme (RFC 8785) – ensures byte‑identical serialisation.
- **Tier:** Gold, Silver, or Bronze, indicating the trust level of the verification method.

## 4. Token JSON Schema (condensed)

The full schema is defined in `schema/vnt-1.0.schema.json`. Required fields:

| Field                   | Type     | Description                                                              |
|-------------------------|----------|--------------------------------------------------------------------------|
| `id`                    | string   | Unique URL or UUID for the token (e.g., `https://issuer/vnt/abc`)        |
| `type`                  | string   | Must be `"VerifiableCredential"`                                         |
| `credentialSubject`     | object   | Contains `claim` (object with `subject`,`predicate`,`object`) and `contentHash` |
| `issuer`                | object   | `id` (DID:key), `name`, `tier`, optionally `reputation`                  |
| `proof`                 | object   | `type`, `proofPurpose`, `verificationMethod`, `created`, `proofValue`    |
| `signatureTimestamp`    | string   | ISO 8601 timestamp of signature creation                                 |
| `verificationMethod`    | string   | `human-expert`, `ai-verified`, or `self-declared`                        |
| `verificationScore`     | number   | 0–1 confidence score                                                     |
| `expirationDate`        | string   | ISO 8601 expiry (recommended ≤ 1 year)                                   |
| `mmrIndex` (optional)   | integer  | Index in Merkle Mountain Range (for blockchain anchoring)                |
| `mmrRoot` (optional)    | string   | MMR root hex string                                                      |
| `inclusionProof` (opt)  | array    | Array of sibling hashes for MMR proof                                    |
| `blockchainAnchor` (opt)| object   | `network`, `txHash`, `blockNumber`, `timestamp`                          |

## 5. Cryptographic primitives

- **SHA3-256** (Keccak-256): used for all hashing.
- **Ed25519**: public‑key signature scheme.
- **JCS (RFC 8785)**: canonical JSON without whitespace reordering; required for deterministic content hash.

## 6. Content hash computation

1. Extract the `claim` object from `credentialSubject`.
2. Serialise the claim object using JCS (deterministic, no extra spaces).
3. Compute SHA3-256 of the resulting UTF‑8 bytes.
4. Encode as `0x` + hex lowercase (64 hex characters). Store in `credentialSubject.contentHash`.

**Example:**  
Claim: `{"subject":"Elebia EVO10 Hook","predicate":"has maximum working load","object":"10,000 kg"}`  
JCS: `{"object":"10,000 kg","predicate":"has maximum working load","subject":"Elebia EVO10 Hook"}`  
Hash: `0xecf633e50d1a7483e126ba80ebce601e1da752ddee91c8a46ef0dd55ac469b3a`

## 7. Signature creation and verification

- **Creation:**  
  1. Remove the `proof` field from the VNT (if present).  
  2. Canonicalise the remaining token object (JCS).  
  3. Sign the bytes with the issuer’s Ed25519 private key.  
  4. Encode the signature as Multibase base58‑btc (prefix `z`). Store as `proof.proofValue`.

- **Verification:**  
  1. Reconstruct the signed payload as above (remove `proof`, JCS).  
  2. Decode `proofValue` (strip leading `z`, decode base58).  
  3. Verify Ed25519 signature using the public key extracted from `issuer.id` (DID:key).  
  4. Recompute content hash and compare to `credentialSubject.contentHash`.

## 8. DID:key generation and usage

Ed25519 public key (32 bytes) → prepend multicodec prefix `0xED` (1 byte) → encode with multibase base58‑btc (which adds a leading `z`) → the resulting string is `z` + base58‑encoded bytes. The DID is `did:key:` followed by that full encoded string (including the leading `z`).  
Example: `did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK`

## 9. Trust tiers

| Tier   | `verificationMethod`       | `verificationScore` meaning                         | Requirements                                                   |
|--------|----------------------------|-----------------------------------------------------|----------------------------------------------------------------|
| Gold   | `human-expert`             | Probability that claim is correct (≥0.95)           | Licensed professional with physical inspection or documented test |
| Silver | `ai-verified`              | Confidence from AI model (≥0.80)                    | Specific AI engine (e.g., Gemini, GPT-4o) and traceable prompt |
| Bronze | `self-declared`            | Subjective confidence (any score)                   | Issuer’s own responsibility, no external verification          |

## 10. Registry format and governance

The `registry/registry.json` file lists known issuers. It is optional for offline verification but recommended for discoverability. Each entry:

```json
{
  "id": "did:key:...",
  "domain": "example.org",
  "name": "Example",
  "tier": "founding",
  "reputation": 5.0,
  "status": "active",
  "added": "2025-01-01"
}
```

Changes are made via GitHub Pull Request with domain control verification.

## 11. Blockchain anchoring (optional)

Anchoring uses a Merkle Mountain Range (MMR) over a batch of tokens. The root is committed to an EVM chain. A VNT may include `mmrIndex`, `mmrRoot`, and `inclusionProof` so that a verifier can cross‑check against an on‑chain root. The `blockchainAnchor` object provides direct transaction evidence.

## 12. Verification steps (offline)

1. Validate JSON schema.
2. Check that `expirationDate` is not in the past.
3. Recompute content hash and compare.
4. Rebuild signed payload (remove `proof`, JCS).
5. Verify Ed25519 signature using `issuer.id`.
6. (Optional) Verify MMR inclusion proof against a trusted root.
7. (Optional) Verify blockchain anchor by looking up the transaction.

All steps require no network calls except optional anchor verification.

## 13. Security and privacy considerations

- Private keys must be stored securely; compromise allows forged tokens.
- Use short expiration periods to limit replay.
- DID:key does not provide revocation; use expiration or on‑chain revocation registries.
- Content hash prevents claim tampering but does not encrypt data – claims are public.

## 14. Appendix: test vectors

See `test-vectors/` directory for valid, invalid‑signature, and tampered‑claim examples.
