import { QuestionSpecification } from '../types/QuestionSpecification.js';

export interface QualityValidationResult {
  valid: boolean;
  classification: 'VALID' | 'REPAIRABLE' | 'INVALID' | 'PLACEHOLDER' | 'DUPLICATE';
  issues: string[];
}

export class QuestionQualityValidator {
  public validateQuality(spec: QuestionSpecification): QualityValidationResult {
    const issues: string[] = [];

    // 1. Placeholder detection
    const stmt = spec.problem?.problemStatement || '';
    if (stmt.includes('perform efficient computation using') || stmt.includes('generic problem statement')) {
      return {
        valid: false,
        classification: 'PLACEHOLDER',
        issues: ['Generic placeholder statement detected'],
      };
    }

    // 2. Ambiguous output or missing formats
    if (!spec.problem?.inputFormat || spec.problem.inputFormat.trim() === '') {
      issues.push('Missing input format specification');
    }
    if (!spec.problem?.outputFormat || spec.problem.outputFormat.trim() === '') {
      issues.push('Missing output format specification');
    }
    if (!spec.problem?.constraints || spec.problem.constraints.length === 0) {
      issues.push('Missing quantitative constraints');
    }

    // 3. Test suite completeness
    if (!spec.tests?.examples || spec.tests.examples.length < 1) {
      issues.push('Fewer than 1 example test cases');
    }
    if (!spec.tests?.visible || spec.tests.visible.length < 2) {
      issues.push('Fewer than 2 visible test cases');
    }
    if (!spec.tests?.hidden || spec.tests.hidden.length < 2) {
      issues.push('Fewer than 2 hidden test cases');
    }
    if (!spec.tests?.edge || spec.tests.edge.length < 1) {
      issues.push('Fewer than 1 edge test cases');
    }

    // 4. Reference solution check
    if (!spec.referenceSolutions || spec.referenceSolutions.length === 0) {
      issues.push('Missing reference solution');
    } else {
      const ref = spec.referenceSolutions[0];
      if (!ref.javaCode || ref.javaCode.trim() === '') {
        issues.push('Reference solution Java code is empty');
      }
    }

    if (issues.length > 0) {
      return {
        valid: false,
        classification: 'REPAIRABLE',
        issues,
      };
    }

    return {
      valid: true,
      classification: 'VALID',
      issues: [],
    };
  }
}

export const questionQualityValidator = new QuestionQualityValidator();
