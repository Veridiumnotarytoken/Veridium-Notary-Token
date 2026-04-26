import base58
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

def did_to_public_key(did: str) -> bytes:
    """Convert DID:key to public key bytes"""
    multibase_part = did.split(':')[-1]
    decoded = base58.b58decode(multibase_part)
    # Remove the multicodec prefix (0xED)
    return decoded[1:]

def public_key_to_did(public_key: Ed25519PublicKey) -> str:
    """Convert public key to DID:key"""
    raw = public_key.public_bytes_raw()
    # Add multicodec prefix for Ed25519 (0xED)
    multicodec = b'\xed' + raw
    encoded = base58.b58encode(multicodec).decode('ascii')
    return 'did:key:' + encoded
