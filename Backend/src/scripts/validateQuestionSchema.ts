import { arr01Spec } from '../seed/referenceQuestions/arr_01_spec.js';
import { validateQuestionSpecification } from '../validation/QuestionSpecificationValidator.js';

console.log('🔍 Running Question Specification Schema Validator Audit...\n');

const result = validateQuestionSpecification(arr01Spec);

console.log(`Question ID: ${arr01Spec.problem.id}`);
console.log(`Question Title: "${arr01Spec.problem.title}"`);
console.log(`Validation Result: ${result.valid ? '✅ PASS' : '❌ FAIL'}\n`);

if (result.errors.length > 0) {
  console.log(`❌ ERRORS (${result.errors.length}):`);
  result.errors.forEach((err, idx) => {
    console.log(`   ${idx + 1}. [${err.code}] Field '${err.field}': ${err.message}`);
  });
} else {
  console.log('✅ No errors detected.');
}

if (result.warnings.length > 0) {
  console.log(`\n⚠️ WARNINGS (${result.warnings.length}):`);
  result.warnings.forEach((warn, idx) => {
    console.log(`   ${idx + 1}. [${warn.code}] Field '${warn.field}': ${warn.message}`);
  });
} else {
  console.log('✅ No warnings detected.');
}

if (!result.valid) {
  console.error('\n❌ Question Specification Schema Validation Failed.');
  process.exit(1);
} else {
  console.log('\n🎉 Question Specification Schema Validation Passed Successfully!');
  process.exit(0);
}
