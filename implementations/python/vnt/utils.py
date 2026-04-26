import base58
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

def did_to_public_key(did: str) -> bytes:
    """Convert DID:key to public key bytes (32 bytes)"""
    # Extract the multibase part after 'did:key:'
    multibase_part = did.split(':')[-1]
    
    # Decode from base58
    decoded = base58.b58decode(multibase_part)
    
    # The decoded bytes contain: multicodec prefix (1 byte) + public key (32 bytes)
    # For Ed25519, the prefix is 0xED
    if len(decoded) != 33:
        raise ValueError(f"Expected 33 bytes (prefix + key), got {len(decoded)}")
    
    # Return only the public key (skip the first prefix byte)
    return decoded[1:]  # This should be exactly 32 bytes

def public_key_to_did(public_key: Ed25519PublicKey) -> str:
    """Convert public key to DID:key"""
    raw = public_key.public_bytes_raw()
    
    # Add multicodec prefix for Ed25519 (0xED)
    multicodec = b'\xed' + raw  # This gives 1 + 32 = 33 bytes
    
    # Encode with base58
    encoded = base58.b58encode(multicodec).decode('ascii')
    
    return 'did:key:' + encoded
