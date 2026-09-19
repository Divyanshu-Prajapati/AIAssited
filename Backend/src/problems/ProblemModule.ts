import { QuestionSpecification } from '../types/QuestionSpecification.js';

export type OutputValidationMode = 'EXACT' | 'NORMALIZED' | 'ANY_VALID' | 'CUSTOM';

export interface ProblemModule {
  specification: QuestionSpecification;
  outputValidationMode?: OutputValidationMode;
  customValidatorId?: string;
}
