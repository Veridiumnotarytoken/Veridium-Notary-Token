# VNT CLI

Global installation: `npm install -g @veridium/vnt-cli`

## Commands

- `vnt verify token.json` – checks validity, prints result.
- `vnt issue` – interactive token issuance.
- `vnt sign claim.json --key private.key` – sign existing claim.

## Example

```bash
vnt issue
# Follow prompts → token saved to vnt-1234567890.json
vnt verify vnt-1234567890.json
```
