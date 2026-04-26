# Registry Guide

The registry is a simple JSON file listing known issuers. It is **optional** for verification but helps users trust an issuer.

To add your organisation:
1. Fork the repo.
2. Edit `registry/registry.json`.
3. Add an object like:
   ```json
   {
     "id": "did:key:z...",
     "domain": "yourdomain.org",
     "name": "Your Company",
     "tier": "silver",
     "reputation": 4.5,
     "status": "active",
     "added": "2025-02-01"
   }
   ```
4. Prove domain control by adding a TXT record `_veridium.yourdomain.org` with value `veridium-verify=your-did`.
5. Open a Pull Request.

Maintainers will verify and merge.
