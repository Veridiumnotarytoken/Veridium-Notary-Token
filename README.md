# Verified True – Open Protocol (VNT)

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](LICENSE)
[![JSON Schema Validation](https://github.com/veridium/verified-true-spec/actions/workflows/validate-schema.yml/badge.svg)](https://github.com/veridium/verified-true-spec/actions/workflows/validate-schema.yml)
[![Test Vectors](https://github.com/veridium/verified-true-spec/actions/workflows/test-vectors.yml/badge.svg)](https://github.com/veridium/verified-true-spec/actions/workflows/test-vectors.yml)

**The Veridium Notary Token (VNT)** is an open standard for verifiable, cryptographically signed claims that can be verified entirely offline. It combines content hashing (SHA3‑256), Ed25519 signatures, W3C Verifiable Credentials principles, and optional blockchain anchoring to provide three trust tiers: Gold (human expert), Silver (AI‑verified), and Bronze (self‑declared). The protocol is public domain (CC0) and comes with a reference implementation in TypeScript, Python, and a CLI.

## Quick example – Gold tier token

```json
{
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
    "tier": "gold"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "created": "2025-01-15T10:00:00Z",
    "proofValue": "z3vG...q5p"
  },
  "signatureTimestamp": "2025-01-15T10:00:00Z",
  "verificationMethod": "human-expert",
  "verificationScore": 0.98,
  "expirationDate": "2026-01-15T10:00:00Z"
}
```

## Trust tiers

| Tier   | Verification method                     | Confidence score range | Use case example                        |
|--------|-----------------------------------------|------------------------|------------------------------------------|
| Gold   | Human expert (licensed, on-site)        | 0.95 – 1.00            | Load certificates, safety compliance     |
| Silver | AI‑assisted (Gemini, GPT‑4o verified)   | 0.80 – 0.94            | Product specifications, test reports     |
| Bronze | Self‑declared / user‑submitted          | 0.00 – 0.79            | User reviews, internal notes             |

## Verify a token (offline)

- **CLI**: `vnt verify token.json` → prints validity and detailed checks.
- **TypeScript**: `import { verifyVNT } from '@veridium/vnt'`.
- **Python**: `from veridium_vnt import verify_vnt`.
- **Web tool**: paste token JSON into the [official verifier](https://veridium.io/verify).
- **Manual**: recompute the content hash and verify the Ed25519 signature with any standard crypto library.

## Issue a token

- **CLI**: `vnt issue` (interactive) or `vnt sign claim.json --key private.key` → outputs VNT.
- **API**: use `createVNT()` from the TypeScript/Python libraries.
- **Manual**: follow the [issuance guide](docs/issuance-guide.md).

## Further resources

- [Full specification](spec/vnt-1.0.md)
- [Issuer registry](registry/registry.json)
- [Implementations](implementations/)
- [Verification guide](docs/verification-guide.md)
- [PDF embedding guide](docs/pdf-embedding-guide.md)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose changes, add an issuer to the registry, or report issues.
