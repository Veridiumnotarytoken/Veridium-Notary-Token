import json
import pytest
from vnt.verifier import verify_vnt

def test_valid_token():
    with open('../../test-vectors/valid-token.json') as f:
        token = json.load(f)
    valid, checks, issues = verify_vnt(token)
    assert valid is True
    assert checks['signature_valid'] is True

def test_invalid_signature():
    with open('../../test-vectors/invalid-signature.json') as f:
        token = json.load(f)
    valid, checks, issues = verify_vnt(token)
    assert valid is False
    assert 'Invalid signature' in issues

def test_tampered_claim():
    with open('../../test-vectors/tampered-claim.json') as f:
        token = json.load(f)
    valid, checks, issues = verify_vnt(token)
    assert valid is False
    assert 'Content hash mismatch' in issues
