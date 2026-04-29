import base58
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
 
# ed25519-pub multicodec prefix: 0xed 0x01 (2 bytes)
_ED25519_PREFIX = b'\xed\x01'
 
 
def did_to_public_key(did: str) -> bytes:
    """Convert did:key to raw Ed25519 public key bytes (32 bytes)."""
    # did:key:z<base58btc-encoded-multicodec>
    multibase_part = did.split(':')[-1]
    if not multibase_part.startswith('z'):
        raise ValueError('Expected base58btc multibase (z prefix)')
 
    decoded = base58.b58decode(multibase_part[1:])  # strip 'z' prefix
 
    if not decoded.startswith(_ED25519_PREFIX):
        raise ValueError(f'Expected ed25519-pub multicodec prefix, got {decoded[:2].hex()}')
 
    return decoded[len(_ED25519_PREFIX):]  # 32 bytes
 
 
def public_key_to_did(public_key: Ed25519PublicKey) -> str:
    """Convert Ed25519PublicKey to did:key string."""
    raw = public_key.public_bytes_raw()
    multicodec = _ED25519_PREFIX + raw
    encoded = 'z' + base58.b58encode(multicodec).decode('ascii')
    return 'did:key:' + encoded
 
