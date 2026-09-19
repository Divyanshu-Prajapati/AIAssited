import { prisma } from '../database/db.js';
import { problemRegistry } from '../problems/index.js';
import { validateQuestionSpecification } from '../validation/QuestionSpecificationValidator.js';

async function seed() {
  console.log('🌱 Seeding DSA AI Assessment Lab Database from ProblemRegistry...');

  // 1. Create Default User
  const defaultUser = await prisma.user.upsert({
    where: { email: 'candidate@dsa-lab.local' },
    update: {},
    create: {
      name: 'Candidate Engineer',
      email: 'candidate@dsa-lab.local',
      skillProfile: JSON.stringify({
        topicStrength: {
          Arrays: 50,
          Strings: 50,
          Hashing: 50,
          'Two Pointers': 50,
          'Sliding Window': 50,
          'Prefix Sum': 50,
          'Binary Search': 50,
          Sorting: 50,
          Stack: 50,
          Queue: 50,
          'Linked List': 50,
          Trees: 50,
          Graphs: 50,
          Greedy: 50,
          Recursion: 50,
          Backtracking: 50,
          'Dynamic Programming': 50,
          Intervals: 50,
          'Bit Manipulation': 50,
        },
        averageScore: 0,
        totalSolved: 0,
        totalAttempts: 0,
        successRate: 0,
        averageAttemptsPerQuestion: 0,
        hintUsageCount: 0,
        debuggingPerformanceScore: 70,
        complexityAccuracyScore: 70,
        promptQualityAverage: 70,
        recentPerformance: [],
      }),
    },
  });

  console.log(`👤 User created/verified: ${defaultUser.name} (${defaultUser.id})`);

  // 2. Validate ProblemRegistry integrity before seeding
  const regVal = problemRegistry.validateRegistry();
  if (!regVal.valid) {
    console.error('❌ ProblemRegistry validation failed:', regVal.errors);
    throw new Error('Seed process aborted: ProblemRegistry validation failed.');
  }

  // 3. Seed Questions from ProblemRegistry
  const modules = problemRegistry.getAll();
  let count = 0;

  for (const mod of modules) {
    const spec = mod.specification;
    const p = spec.problem;

    const valRes = validateQuestionSpecification(spec);
    if (!valRes.valid) {
      console.error(`❌ Specification error in question '${p.id}':`, valRes.errors);
      throw new Error(`Seed process aborted: Question '${p.id}' specification is invalid.`);
    }

    const specJson = JSON.stringify(spec);

    await prisma.question.upsert({
      where: { id: p.id },
      update: {
        title: p.title,
        story: p.story || '',
        problemStatement: p.problemStatement,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: Array.isArray(p.constraints) ? p.constraints.join('\n') : p.constraints,
        examples: JSON.stringify(p.examples),
        difficulty: p.difficulty,
        topic: p.topic,
        pattern: p.pattern,
        expectedTimeComplexity: p.expectedTimeComplexity,
        expectedSpaceComplexity: p.expectedSpaceComplexity,
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: spec.starterCode,
        visibleTests: JSON.stringify(spec.tests.visible),
        hiddenTests: JSON.stringify(spec.tests.hidden),
        edgeCases: JSON.stringify(spec.tests.edge),
        tags: JSON.stringify([p.topic, p.pattern]),
        specification: specJson,
        specificationStatus: 'VALIDATED',
        specificationVersion: 1,
      },
      create: {
        id: p.id,
        title: p.title,
        story: p.story || '',
        problemStatement: p.problemStatement,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: Array.isArray(p.constraints) ? p.constraints.join('\n') : p.constraints,
        examples: JSON.stringify(p.examples),
        difficulty: p.difficulty,
        topic: p.topic,
        pattern: p.pattern,
        expectedTimeComplexity: p.expectedTimeComplexity,
        expectedSpaceComplexity: p.expectedSpaceComplexity,
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: spec.starterCode,
        visibleTests: JSON.stringify(spec.tests.visible),
        hiddenTests: JSON.stringify(spec.tests.hidden),
        edgeCases: JSON.stringify(spec.tests.edge),
        tags: JSON.stringify([p.topic, p.pattern]),
        specification: specJson,
        specificationStatus: 'VALIDATED',
        specificationVersion: 1,
      },
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} VALIDATED problem specifications into database.`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

