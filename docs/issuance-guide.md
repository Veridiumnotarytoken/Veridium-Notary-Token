# Issuance Guide

1. Generate an Ed25519 key pair (keep private key secret).
2. Compute the DID:key from the public key.
3. Create a claim object `{ "subject": "...", "predicate": "...", "object": "..." }`.
4. Compute content hash (SHA3-256 of JCS claim).
5. Build the unsigned token (all fields except `proof`).
6. Canonicalise unsigned token and sign with private key.
7. Add the signature as `proof.proofValue` (multibase base58-btc).
8. Optionally, register your DID in the [public registry](registry/registry.json) via PR.
9. Distribute the token JSON to the recipient.

Use the TypeScript/Python libraries or CLI to automate.
