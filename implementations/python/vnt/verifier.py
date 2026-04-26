import json
from datetime import datetime
from typing import Dict, Any, Tuple
from canonicaljson import encode_canonical_json
import hashlib
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
import base58
from .utils import did_to_public_key

def recompute_content_hash(claim: Dict[str, str]) -> str:
    """Recompute SHA3-256 hash of canonicalized claim"""
    canonical = encode_canonical_json(claim)
    hash_obj = hashlib.sha3_256(canonical)
    return '0x' + hash_obj.hexdigest()

def verify_vnt(token: Dict[str, Any]) -> Tuple[bool, Dict[str, bool], list]:
    """Verify a VNT token offline"""
    issues = []
    checks = {
        'schema_valid': True,
        'not_expired': True,
        'content_hash_match': True,
        'signature_valid': False,
    }
    
    # Check expiration
    expiry = datetime.fromisoformat(token['expirationDate'].replace('Z', '+00:00'))
    if expiry < datetime.now().astimezone():
        checks['not_expired'] = False
        issues.append('Token has expired')
    
    # Check content hash
    expected_hash = recompute_content_hash(token['credentialSubject']['claim'])
    if expected_hash != token['credentialSubject']['contentHash']:
        checks['content_hash_match'] = False
        issues.append('Content hash mismatch')
    
    # Verify signature
    proof = token.pop('proof')
    canonical_payload = encode_canonical_json(token)
    token['proof'] = proof
    
    # Decode signature from base58 (remove 'z' prefix)
    signature_bytes = base58.b58decode(proof['proofValue'][1:])
    public_key_bytes = did_to_public_key(token['issuer']['id'])
    public_key = Ed25519PublicKey.from_public_bytes(public_key_bytes)
    
    try:
        public_key.verify(signature_bytes, canonical_payload)
        checks['signature_valid'] = True
    except Exception:
        issues.append('Invalid signature')
    
    valid = all([checks['not_expired'], checks['content_hash_match'], checks['signature_valid']])
    return valid, checks, issues
