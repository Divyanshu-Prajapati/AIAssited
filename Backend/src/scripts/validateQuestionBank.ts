import { problemRegistry } from '../problems/index.js';
import { validateQuestionSpecification } from '../validation/QuestionSpecificationValidator.js';
import { questionQualityValidator } from '../validation/QuestionQualityValidator.js';

console.log('📊 Running Question Bank Audit & Specification Validation...\n');

const modules = problemRegistry.getAll();
const totalCount = modules.length;
let validatedCount = 0;
let legacyCount = 0;
let invalidCount = 0;
let placeholderCount = 0;

const validationFailures: { id: string; errors: string[] }[] = [];

for (const mod of modules) {
  const spec = mod.specification;
  const id = spec.problem.id;

  const specVal = validateQuestionSpecification(spec);
  const qualityVal = questionQualityValidator.validateQuality(spec);

  if (qualityVal.classification === 'PLACEHOLDER') {
    placeholderCount++;
  }

  if (spec.specificationStatus === 'LEGACY_UNVALIDATED') {
    legacyCount++;
  }

  if (specVal.valid && qualityVal.valid && spec.specificationStatus === 'VALIDATED') {
    validatedCount++;
  } else {
    invalidCount++;
    const errs: string[] = [];
    specVal.errors.forEach((e) => errs.push(`[${e.code}] ${e.field}: ${e.message}`));
    qualityVal.issues.forEach((i) => errs.push(`[QUALITY_ISSUE] ${i}`));
    validationFailures.push({ id, errors: errs });
  }
}

console.log('----------------------------------------------------');
console.log(`Total Questions in Bank : ${totalCount}`);
console.log(`Validated Questions     : ${validatedCount}`);
console.log(`Legacy Unvalidated      : ${legacyCount}`);
console.log(`Placeholder Questions   : ${placeholderCount}`);
console.log(`Invalid Specifications  : ${invalidCount}`);
console.log('----------------------------------------------------\n');

if (validationFailures.length > 0 || totalCount !== 118) {
  console.error('❌ Validation Failures Detected:');
  for (const failure of validationFailures) {
    console.error(`Question '${failure.id}':`);
    failure.errors.forEach((err) => console.error(`  - ${err}`));
  }
  process.exit(1);
} else {
  console.log('✅ Question Bank Audit Completed Successfully! (118/118 VALIDATED)');
  process.exit(0);
}
