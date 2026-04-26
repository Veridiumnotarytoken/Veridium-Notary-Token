import secrets
from datetime import datetime
from typing import Dict, Any
from canonicaljson import encode_canonical_json
import hashlib
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import base58
from .utils import public_key_to_did

def create_vnt(
    token_id: str,
    claim: Dict[str, str],
    issuer_name: str,
    issuer_tier: str,
    verification_method: str,
    verification_score: float,
    expiration_date: str,
    private_key: Ed25519PrivateKey,
) -> Dict[str, Any]:
    """Create a new signed VNT token"""
    
    # Compute content hash
    canonical_claim = encode_canonical_json(claim)
    hash_obj = hashlib.sha3_256(canonical_claim)
    content_hash = '0x' + hash_obj.hexdigest()
    
    # Get DID from public key
    public_key = private_key.public_key()
    did = public_key_to_did(public_key)
    
    # Build unsigned token
    unsigned = {
        'id': token_id,
        'type': 'VerifiableCredential',
        'credentialSubject': {
            'claim': claim,
            'contentHash': content_hash,
        },
        'issuer': {
            'id': did,
            'name': issuer_name,
            'tier': issuer_tier,
        },
        'signatureTimestamp': datetime.utcnow().isoformat() + 'Z',
        'verificationMethod': verification_method,
        'verificationScore': verification_score,
        'expirationDate': expiration_date,
    }
    
    # Sign the payload
    canonical_payload = encode_canonical_json(unsigned)
    signature = private_key.sign(canonical_payload)
    
    # Encode signature with base58 and add 'z' prefix
    proof_value = 'z' + base58.b58encode(signature).decode('ascii')
    
    # Add proof
    proof = {
        'type': 'Ed25519Signature2020',
        'proofPurpose': 'assertionMethod',
        'verificationMethod': did,
        'created': datetime.utcnow().isoformat() + 'Z',
        'proofValue': proof_value,
    }
    
    unsigned['proof'] = proof
    return unsigned
