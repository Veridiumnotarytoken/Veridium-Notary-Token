# Verification Guide

1. Obtain the VNT JSON file (e.g., `certificate.json`).
2. Use any of these methods:
   - **CLI**: `vnt verify certificate.json`
   - **Web tool**: go to [veridium.io/verify](https://veridium.io/verify), paste the JSON.
   - **Python**: `from vnt import verify_vnt; valid, checks, issues = verify_vnt(token)`
3. The verifier checks:
   - Schema compliance
   - Expiration date
   - Content hash consistency
   - Ed25519 signature
4. If all pass, the token is authentic and the claim has not been tampered.
5. Optionally, cross‑check the issuer’s DID against the public registry.
