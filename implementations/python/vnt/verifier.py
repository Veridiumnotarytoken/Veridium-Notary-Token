from typing import Dict, Any, Tuple
from canonicaljson import encode_canonical_json
import hashlib
import base58
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from .utils import did_to_public_key
 
 
def verify_vnt(token: Dict[str, Any]) -> Tuple[bool, Dict[str, bool], list]:
    """Verify a VNT token. Returns (valid, checks, issues)."""
    issues = []
    checks = {
        'schema_valid': True,
        'not_expired': True,
        'content_hash_match': True,
        'signature_valid': False,
    }
 
    token = dict(token)  # shallow copy to avoid mutating caller's dict
 
    # Check expiry
    from datetime import datetime, timezone
    try:
        expiry = datetime.fromisoformat(token['expirationDate'].replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        if expiry < now:
            checks['not_expired'] = False
            issues.append('Token has expired')
    except Exception as e:
        checks['not_expired'] = False
        issues.append(f'Invalid expirationDate: {e}')
 
    # Check content hash
    try:
        claim = token['credentialSubject']['claim']
        canonical_claim = encode_canonical_json(claim)
        expected_hash = '0x' + hashlib.sha3_256(canonical_claim).hexdigest()
        if expected_hash != token['credentialSubject']['contentHash']:
            checks['content_hash_match'] = False
            issues.append('Content hash mismatch')
    except Exception as e:
        checks['content_hash_match'] = False
        issues.append(f'Content hash error: {e}')
 
    # Verify signature
    try:
        proof = token.pop('proof')
        canonical_payload = encode_canonical_json(token)
        token['proof'] = proof
 
        # proofValue is a multibase base58btc string with 'z' prefix
        signature_bytes = base58.b58decode(proof['proofValue'][1:])
 
        public_key_bytes = did_to_public_key(token['issuer']['id'])
        public_key = Ed25519PublicKey.from_public_bytes(public_key_bytes)
 
        # cryptography's verify raises InvalidSignature on failure
        public_key.verify(signature_bytes, canonical_payload)
        checks['signature_valid'] = True
    except Exception as e:
        issues.append(f'Invalid signature: {e}')
 
    valid = all([checks['not_expired'], checks['content_hash_match'], checks['signature_valid']])
    return valid, checks, issues
 
