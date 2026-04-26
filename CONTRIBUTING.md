# Contributing to Verified True (VNT)

We ❤️ contributions. This project is open to anyone.

## How to propose changes to the specification

1. Fork the repository.
2. Create a branch: `spec/your-proposal`.
3. Edit `spec/vnt-1.0.md` or any other files.
4. Ensure JSON examples and test vectors remain valid (run `ajv` locally).
5. Open a Pull Request describing your changes and rationale.
6. Request a review from one of the maintainers.

All spec changes must be backward‑compatible or require a new version (v1.1, v2.0).

## Adding a new issuer to `registry.json`

Anyone can add their organisation to the public registry:

- Fork the repo.
- Edit `registry/registry.json`.
- Add your issuer object following the existing format (must include `id`, `domain`, `reputation`, `status`).
- **Verify domain control**: we require that you add a TXT record `veridium-verify=your-did` to your domain `_veridium` subdomain and link to the PR.
- Submit a Pull Request. Once verified and merged, your issuer becomes part of the official registry.

## Code of Conduct

- Be respectful and constructive.
- No harassment, hate speech, or personal attacks.
- Disagreements should be resolved through technical arguments, not insults.

Maintainers have the right to block or revert contributions that violate this code.
