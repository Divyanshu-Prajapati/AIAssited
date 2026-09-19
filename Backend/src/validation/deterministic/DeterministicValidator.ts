import { QuestionSpecification } from '../../types/QuestionSpecification.js';
import { ValidationEvaluationResult } from '../../types/ValidationDecision.js';
import { normalizeComplexity } from '../QuestionSpecificationValidator.js';

export class DeterministicValidator {
  /**
   * Deterministic checks for Step 1 (Understanding)
   */
  public validateStep1(
    text: string,
    spec: QuestionSpecification
  ): {
    valid: boolean;
    result: ValidationEvaluationResult;
  } {
    const trimmed = text.trim();
    if (trimmed.length < 15) {
      return {
        valid: false,
        result: {
          decision: 'INSUFFICIENT_EVIDENCE',
          confidence: 1.0,
          criticalFailures: ['Response is too short to demonstrate problem understanding.'],
          missingRequirements: spec.validation.understanding.requirements.map((r) => r.description),
          matchedRequirements: [],
          contradictions: [],
          feedback: 'Please provide a clear explanation of the problem objective, inputs, outputs, and edge cases.',
          evidence: [],
          score: 0,
        },
      };
    }

    const lowerText = trimmed.toLowerCase();
    const contradictions: string[] = [];
    const criticalFailures: string[] = [];
    const matchedRequirements: string[] = [];
    const missingRequirements: string[] = [];
    const evidence: string[] = [];

    // Check prohibited misunderstandings
    const prohibited = spec.validation.understanding.prohibitedMisunderstandings || [];
    for (const mis of prohibited) {
      const lowerMis = mis.toLowerCase();
      // Heuristic checks for common misunderstandings
      if (lowerMis.includes('non-contiguous') && (lowerText.includes('any elements') || lowerText.includes('non contiguous') || lowerText.includes('non-contiguous') || lowerText.includes('pick any element'))) {
        contradictions.push(`Candidate assumes non-contiguous elements can be selected (Prohibited: "${mis}")`);
        criticalFailures.push(`Semantic misunderstanding detected: contiguous subarray requirement is violated.`);
      }
      if (lowerMis.includes('positive') && (lowerText.includes('only positive') || lowerText.includes('assume positive'))) {
        contradictions.push(`Candidate assumes array only contains positive numbers (Prohibited: "${mis}")`);
        criticalFailures.push(`Semantic misunderstanding detected: problem includes negative stock adjustments.`);
      }
    }

    // Check requirements
    const reqs = spec.validation.understanding.requirements || [];
    let criticalMissing = false;

    for (const req of reqs) {
      let matched = false;
      // Match against acceptable evidence phrases or semantic concepts
      for (const phrase of req.acceptableEvidence) {
        if (lowerText.includes(phrase.toLowerCase())) {
          matched = true;
          evidence.push(`Matched evidence for '${req.id}': "${phrase}"`);
          break;
        }
      }

      if (!matched && req.concepts) {
        const conceptMatches = req.concepts.filter((c) => lowerText.includes(c.toLowerCase()));
        if (conceptMatches.length >= Math.ceil(req.concepts.length / 2)) {
          matched = true;
          evidence.push(`Matched concepts for '${req.id}': [${conceptMatches.join(', ')}]`);
        }
      }

      if (matched) {
        matchedRequirements.push(req.description);
      } else {
        missingRequirements.push(req.description);
        if (req.critical) {
          criticalMissing = true;
          criticalFailures.push(`Missing critical requirement: ${req.description}`);
        }
      }
    }

    const totalReqs = reqs.length || 1;
    const score = Math.round((matchedRequirements.length / totalReqs) * 100);

    if (criticalFailures.length > 0 || criticalMissing) {
      return {
        valid: false,
        result: {
          decision: 'FAIL',
          confidence: 0.9,
          criticalFailures,
          missingRequirements,
          matchedRequirements,
          contradictions,
          feedback: `Your understanding is incomplete or contains critical errors: ${criticalFailures.join(' ')}`,
          evidence,
          score,
        },
      };
    }

    return {
      valid: true,
      result: {
        decision: 'PASS',
        confidence: 0.95,
        criticalFailures: [],
        missingRequirements: [],
        matchedRequirements,
        contradictions: [],
        feedback: 'Step 1 Problem Understanding validated successfully.',
        evidence,
        score,
      },
    };
  }

  /**
   * Deterministic checks for Step 2 (Plan)
   */
  public validateStep2(
    text: string,
    spec: QuestionSpecification
  ): {
    valid: boolean;
    result: ValidationEvaluationResult;
  } {
    const trimmed = text.trim();
    if (trimmed.length < 20) {
      return {
        valid: false,
        result: {
          decision: 'INSUFFICIENT_EVIDENCE',
          confidence: 1.0,
          criticalFailures: ['Plan response is too short to explain an algorithmic solution.'],
          missingRequirements: spec.validation.plan.requirements.map((r) => r.description),
          matchedRequirements: [],
          contradictions: [],
          feedback: 'Please provide a detailed algorithmic approach, data structure choice, and time/space complexity.',
          evidence: [],
          score: 0,
        },
      };
    }

    const lowerText = trimmed.toLowerCase();
    const evidence: string[] = [];

    // Parse time and space complexity from text
    const extractedTime = this.extractTimeComplexity(trimmed);
    const extractedSpace = this.extractSpaceComplexity(trimmed);

    // Identify matched approach
    let matchedApproach = spec.acceptedApproaches.find((app) => {
      // Check approach name or concepts
      if (lowerText.includes(app.name.toLowerCase())) return true;
      if (app.id && lowerText.includes(app.id.toLowerCase())) return true;
      // Concept matching
      if (app.concepts && app.concepts.length > 0) {
        const matches = app.concepts.filter((c) => lowerText.includes(c.toLowerCase()));
        if (matches.length >= Math.min(1, app.concepts.length)) {
          return true;
        }
      }
      return false;
    });

    // Fallback approach detection for Kadane / Subarray max
    if (!matchedApproach && spec.problem.id === 'arr_01') {
      if (lowerText.includes('kadane') || lowerText.includes('running max') || lowerText.includes('current max') || (lowerText.includes('max') && lowerText.includes('ending at'))) {
        matchedApproach = spec.acceptedApproaches.find((a) => a.id === 'kadane_linear_scan');
      } else if (lowerText.includes('nested loop') || lowerText.includes('all pairs') || lowerText.includes('brute force') || lowerText.includes('all subarray pairs') || lowerText.includes('pairs [i..j]')) {
        matchedApproach = spec.acceptedApproaches.find((a) => a.id === 'brute_force_subarrays');
      }
    }

    const matchedRequirements: string[] = [];
    const missingRequirements: string[] = [];
    const criticalFailures: string[] = [];

    const reqs = spec.validation.plan.requirements || [];
    for (const req of reqs) {
      let matched = false;
      for (const phrase of req.acceptableEvidence) {
        if (lowerText.includes(phrase.toLowerCase())) {
          matched = true;
          evidence.push(`Matched evidence for '${req.id}': "${phrase}"`);
          break;
        }
      }
      if (!matched && req.concepts) {
        const matches = req.concepts.filter((c) => lowerText.includes(c.toLowerCase()));
        if (matches.length >= Math.ceil(req.concepts.length / 2)) {
          matched = true;
          evidence.push(`Matched concepts for '${req.id}': [${matches.join(', ')}]`);
        }
      }
      if (matched) {
        matchedRequirements.push(req.description);
      } else {
        missingRequirements.push(req.description);
        if (req.critical) {
          criticalFailures.push(`Missing critical requirement: ${req.description}`);
        }
      }
    }

    const score = Math.round((matchedRequirements.length / (reqs.length || 1)) * 100);

    if (criticalFailures.length > 0 && !matchedApproach) {
      return {
        valid: false,
        result: {
          decision: 'FAIL',
          confidence: 0.85,
          criticalFailures,
          missingRequirements,
          matchedRequirements,
          contradictions: [],
          feedback: 'Plan lacks a valid algorithm or fails critical plan requirements.',
          evidence,
          score,
          parsedTimeComplexity: extractedTime || undefined,
          parsedSpaceComplexity: extractedSpace || undefined,
        },
      };
    }

    if (matchedApproach) {
      evidence.push(`Identified accepted approach: '${matchedApproach.name}' (${matchedApproach.id})`);
      if (matchedApproach.optimal) {
        return {
          valid: true,
          result: {
            decision: 'PASS',
            confidence: 0.95,
            criticalFailures: [],
            missingRequirements,
            matchedRequirements,
            contradictions: [],
            feedback: `Optimal approach '${matchedApproach.name}' proposed.`,
            evidence,
            score,
            approachId: matchedApproach.id,
            parsedTimeComplexity: extractedTime || matchedApproach.timeComplexity,
            parsedSpaceComplexity: extractedSpace || matchedApproach.spaceComplexity,
          },
        };
      } else {
        return {
          valid: true,
          result: {
            decision: 'CORRECT_BUT_INEFFICIENT',
            confidence: 0.9,
            criticalFailures: [],
            missingRequirements,
            matchedRequirements,
            contradictions: [],
            feedback: `Correct but inefficient approach '${matchedApproach.name}' proposed (${matchedApproach.timeComplexity}). Consider an optimal O(N) solution.`,
            evidence,
            score,
            approachId: matchedApproach.id,
            parsedTimeComplexity: extractedTime || matchedApproach.timeComplexity,
            parsedSpaceComplexity: extractedSpace || matchedApproach.spaceComplexity,
          },
        };
      }
    }

    // Default if requirements match but approach is not explicitly identified
    return {
      valid: true,
      result: {
        decision: 'PASS',
        confidence: 0.8,
        criticalFailures: [],
        missingRequirements,
        matchedRequirements,
        contradictions: [],
        feedback: 'Plan meets core requirements.',
        evidence,
        score,
        parsedTimeComplexity: extractedTime || undefined,
        parsedSpaceComplexity: extractedSpace || undefined,
      },
    };
  }

  /**
   * Deterministic checks for Step 3 (Implementation)
   */
  public validateStep3(
    text: string,
    spec: QuestionSpecification
  ): {
    valid: boolean;
    result: ValidationEvaluationResult;
  } {
    const trimmed = text.trim();
    if (trimmed.length < 25) {
      return {
        valid: false,
        result: {
          decision: 'INSUFFICIENT_EVIDENCE',
          confidence: 1.0,
          criticalFailures: ['Implementation explanation is too short.'],
          missingRequirements: spec.validation.implementation.requirements.map((r) => r.description),
          matchedRequirements: [],
          contradictions: [],
          feedback: 'Please describe the implementation steps in detail, including variables, control flow, and boundary handling.',
          evidence: [],
          score: 0,
        },
      };
    }

    const lowerText = trimmed.toLowerCase();
    const evidence: string[] = [];
    const matchedRequirements: string[] = [];
    const missingRequirements: string[] = [];
    const criticalFailures: string[] = [];

    const reqs = spec.validation.implementation.requirements || [];
    for (const req of reqs) {
      let matched = false;
      for (const phrase of req.acceptableEvidence) {
        if (lowerText.includes(phrase.toLowerCase())) {
          matched = true;
          evidence.push(`Matched evidence for '${req.id}': "${phrase}"`);
          break;
        }
      }
      if (!matched && req.concepts) {
        const matches = req.concepts.filter((c) => lowerText.includes(c.toLowerCase()));
        if (matches.length >= Math.ceil(req.concepts.length / 2)) {
          matched = true;
          evidence.push(`Matched concepts for '${req.id}': [${matches.join(', ')}]`);
        }
      }
      if (matched) {
        matchedRequirements.push(req.description);
      } else {
        missingRequirements.push(req.description);
        if (req.critical) {
          criticalFailures.push(`Missing critical implementation requirement: ${req.description}`);
        }
      }
    }

    const score = Math.round((matchedRequirements.length / (reqs.length || 1)) * 100);

    if (criticalFailures.length > 0) {
      return {
        valid: false,
        result: {
          decision: 'FAIL',
          confidence: 0.85,
          criticalFailures,
          missingRequirements,
          matchedRequirements,
          contradictions: [],
          feedback: 'Implementation description fails critical implementation requirements.',
          evidence,
          score,
        },
      };
    }

    return {
      valid: true,
      result: {
        decision: 'PASS',
        confidence: 0.9,
        criticalFailures: [],
        missingRequirements: [],
        matchedRequirements,
        contradictions: [],
        feedback: 'Implementation description meets all requirements.',
        evidence,
        score,
      },
    };
  }

  public extractTimeComplexity(text: string): string | null {
    const timeMatch = text.match(/O\s*\(\s*(1|N|N\^2|N\s*\*\s*N|N\s*log\s*N|log\s*N)\s*\)/i);
    if (timeMatch) return normalizeComplexity(`O(${timeMatch[1]})`);
    return null;
  }

  public extractSpaceComplexity(text: string): string | null {
    const spaceMatches = Array.from(text.matchAll(/O\s*\(\s*(1|N|N\^2|N\s*\*\s*N|N\s*log\s*N|log\s*N)\s*\)/gi));
    if (spaceMatches.length >= 2) {
      return normalizeComplexity(`O(${spaceMatches[1][1]})`);
    }
    return null;
  }
}

export const deterministicValidator = new DeterministicValidator();
