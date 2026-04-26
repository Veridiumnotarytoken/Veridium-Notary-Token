def verify_vnt(token: Dict[str, Any]) -> Tuple[bool, Dict[str, bool], list]:
    # ... (codi anterior igual) ...
    
    # Verify signature
    proof = token.pop('proof')
    canonical_payload = encode_canonical_json(token)
    token['proof'] = proof
    
    try:
        # Decode signature from base58 (remove 'z' prefix)
        signature_bytes = base58.b58decode(proof['proofValue'][1:])
        
        # Get public key (32 bytes)
        public_key_bytes = did_to_public_key(token['issuer']['id'])
        
        # Create public key object
        public_key = Ed25519PublicKey.from_public_bytes(public_key_bytes)
        
        # Verify
        public_key.verify(signature_bytes, canonical_payload)
        checks['signature_valid'] = True
    except Exception as e:
        issues.append(f'Invalid signature: {str(e)}')
    
    # ... (resta del codi)
