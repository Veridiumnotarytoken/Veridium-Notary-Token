export interface Claim {
  subject: string;
  predicate: string;
  object: string;
}

export interface CredentialSubject {
  claim: Claim;
  contentHash: string;
}

export interface Issuer {
  id: string;
  name: string;
  tier: 'gold' | 'silver' | 'bronze' | 'founding';
  reputation?: number;
}

export interface Proof {
  type: 'Ed25519Signature2020';
  proofPurpose: 'assertionMethod';
  verificationMethod: string;
  created: string;
  proofValue: string;
}

export interface BlockchainAnchor {
  network: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
}

export interface VNT {
  id: string;
  type: 'VerifiableCredential';
  credentialSubject: CredentialSubject;
  issuer: Issuer;
  proof: Proof;
  signatureTimestamp: string;
  verificationMethod: 'human-expert' | 'ai-verified' | 'self-declared';
  verificationScore: number;
  expirationDate: string;
  mmrIndex?: number;
  mmrRoot?: string;
  inclusionProof?: string[];
  blockchainAnchor?: BlockchainAnchor;
}

export interface VerificationResult {
  valid: boolean;
  checks: {
    schemaValid: boolean;
    notExpired: boolean;
    contentHashMatch: boolean;
    signatureValid: boolean;
  };
  issues: string[];
}
