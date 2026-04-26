import json
from datetime import datetime
from typing import Dict, Any, Tuple
from canonicaljson import encode_canonical_json
from Crypto.Hash import SHA3_256
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from multibase import decode
from .utils import did_to_public_key

def recompute_content_hash(claim: Dict[str, str]) -> str:
    canonical = encode_canonical_json(claim)
    h = SHA3_256.new()
    h.update(canonical)
    return '0x' + h.hexdigest()

def verify_vnt(token: Dict[str, Any]) -> Tuple[bool, Dict[str, bool], list]:
    issues = []
    checks = {
        'schema_valid': True,
        'not_expired': True,
        'content_hash_match': True,
        'signature_valid': False,
    }
    
    expiry = datetime.fromisoformat(token['expirationDate'].replace('Z', '+00:00'))
    if expiry < datetime.now().astimezone():
        checks['not_expired'] = False
        issues.append('Token has expired')
    
    expected = recompute_content_hash(token['credentialSubject']['claim'])
    if expected != token['credentialSubject']['contentHash']:
        checks['content_hash_match'] = False
        issues.append('Content hash mismatch')
    
    proof = token.pop('proof')
    canonical_payload = encode_canonical_json(token)
    token['proof'] = proof
    
    signature_bytes = decode(proof['proofValue'])[1:]
    public_key = did_to_public_key(token['issuer']['id'])
    try:
        Ed25519PublicKey.from_public_bytes(public_key).verify(signature_bytes, canonical_payload)
        checks['signature_valid'] = True
    except Exception:
        issues.append('Invalid signature')
    
    valid = all([checks['not_expired'], checks['content_hash_match'], checks['signature_valid']])
    return valid, checks, issues
