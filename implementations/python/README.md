# veridium-vnt – Python library

Install: `pip install veridium-vnt`

## Usage

```python
from vnt import verify_vnt, create_vnt
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import json

with open('token.json') as f:
    token = json.load(f)
valid, checks, issues = verify_vnt(token)

private_key = Ed25519PrivateKey.generate()
new_token = create_vnt(
    token_id='https://my.org/vnt/123',
    claim={'subject': 'Bolt', 'predicate': 'has torque', 'object': '50 Nm'},
    issuer_name='MyOrg',
    issuer_tier='silver',
    verification_method='ai-verified',
    verification_score=0.89,
    expiration_date='2025-12-31T23:59:59Z',
    private_key=private_key,
)
```

See full API reference in the [TypeScript README](../typescript/README.md) (similar logic).
