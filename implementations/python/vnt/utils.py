from multibase import decode, encode
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

def did_to_public_key(did: str) -> bytes:
    multibase_part = did.split(':')[-1]
    decoded = decode(multibase_part)
    return decoded[1:]

def public_key_to_did(public_key: Ed25519PublicKey) -> str:
    raw = public_key.public_bytes_raw()
    multicodec = b'\xed' + raw
    encoded = encode('base58btc', multicodec).decode('ascii')
    return 'did:key:' + encoded
