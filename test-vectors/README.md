# VNT Test Vectors

This directory contains test JSON files that represent different verification scenarios.

- `valid-token.json` – A correctly signed, unexpired Gold token. Must pass all checks.
- `invalid-signature.json` – The same token but with a single character altered in `proofValue`. Signature verification must fail.
- `tampered-claim.json` – A token where the claim object (e.g., `object` field) has been changed after signing, so the content hash no longer matches.

Use these files to validate verifier implementations.
