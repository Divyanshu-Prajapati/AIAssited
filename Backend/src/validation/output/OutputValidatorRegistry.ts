import { OutputValidationMode } from '../../problems/ProblemModule.js';

export interface OutputValidationRequest {
  mode: OutputValidationMode;
  validatorId?: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
}

export interface OutputValidationResult {
  valid: boolean;
  message?: string;
}

export type CustomOutputValidator = (
  input: string,
  expectedOutput: string,
  actualOutput: string
) => OutputValidationResult;

export class OutputValidatorRegistry {
  private customValidators = new Map<string, CustomOutputValidator>();

  constructor() {
    this.registerCustomValidator('PEAK_INDEX', this.validatePeakIndex);
  }

  public registerCustomValidator(id: string, validator: CustomOutputValidator): void {
    this.customValidators.set(id, validator);
  }

  public validateOutput(req: OutputValidationRequest): OutputValidationResult {
    const actualStr = req.actualOutput.trim();
    const expectedStr = req.expectedOutput.trim();

    switch (req.mode) {
      case 'EXACT':
        return {
          valid: actualStr === expectedStr,
          message: actualStr === expectedStr ? undefined : `Expected exact output "${expectedStr}", got "${actualStr}"`,
        };

      case 'NORMALIZED': {
        const normActual = actualStr.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
        const normExpected = expectedStr.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
        return {
          valid: normActual === normExpected,
          message: normActual === normExpected ? undefined : `Expected normalized output "${normExpected}", got "${normActual}"`,
        };
      }

      case 'ANY_VALID': {
        const allowed = expectedStr.split('|').map((s) => s.trim());
        return {
          valid: allowed.includes(actualStr),
          message: allowed.includes(actualStr) ? undefined : `Expected one of [${allowed.join(', ')}], got "${actualStr}"`,
        };
      }

      case 'CUSTOM': {
        if (!req.validatorId) {
          return { valid: false, message: 'Custom validator ID not specified' };
        }
        const customFn = this.customValidators.get(req.validatorId);
        if (!customFn) {
          return { valid: false, message: `Custom validator '${req.validatorId}' not registered` };
        }
        return customFn(req.input, req.expectedOutput, req.actualOutput);
      }

      default:
        return { valid: actualStr === expectedStr };
    }
  }

  /**
   * Custom Validator for ARR-002: Peak Element Index
   */
  private validatePeakIndex(input: string, expectedOutput: string, actualOutput: string): OutputValidationResult {
    const lines = input.trim().split('\n');
    if (lines.length < 2) {
      return { valid: false, message: 'Invalid test input format' };
    }

    const arr = lines[1].trim().split(/\s+/).map(Number);
    const candidateIdx = parseInt(actualOutput.trim(), 10);

    if (isNaN(candidateIdx) || candidateIdx < 0 || candidateIdx >= arr.length) {
      return { valid: false, message: `Output index ${actualOutput.trim()} is out of array bounds [0..${arr.length - 1}]` };
    }

    const leftOk = candidateIdx === 0 || arr[candidateIdx] > arr[candidateIdx - 1];
    const rightOk = candidateIdx === arr.length - 1 || arr[candidateIdx] > arr[candidateIdx + 1];

    if (leftOk && rightOk) {
      return { valid: true };
    }

    return {
      valid: false,
      message: `Index ${candidateIdx} (value ${arr[candidateIdx]}) is not a peak element. Neighbor values: left=${candidateIdx > 0 ? arr[candidateIdx - 1] : 'N/A'}, right=${candidateIdx < arr.length - 1 ? arr[candidateIdx + 1] : 'N/A'}`,
    };
  }
}

export const outputValidatorRegistry = new OutputValidatorRegistry();
