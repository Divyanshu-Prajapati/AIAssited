export type ValidationDecision =
  | 'PASS'
  | 'FAIL'
  | 'CORRECT_BUT_INEFFICIENT'
  | 'INCONSISTENT'
  | 'INSUFFICIENT_EVIDENCE';

export interface ValidationRequirementResult {
  requirementId: string;
  matched: boolean;
  evidenceFound?: string;
  reason?: string;
}

export interface ValidationEvaluationResult {
  decision: ValidationDecision;
  confidence: number;
  criticalFailures: string[];
  missingRequirements: string[];
  matchedRequirements: string[];
  contradictions: string[];
  feedback: string;
  evidence: string[];
  score: number;
  approachId?: string;
  parsedTimeComplexity?: string;
  parsedSpaceComplexity?: string;
}
