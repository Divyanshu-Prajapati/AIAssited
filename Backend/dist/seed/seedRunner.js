"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../database/db.js");
const questionBank_js_1 = require("./questionBank.js");
async function seed() {
    console.log('🌱 Seeding DSA AI Assessment Lab Database...');
    // 1. Create Default User
    const defaultUser = await db_js_1.prisma.user.upsert({
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
    // 2. Seed Questions
    let count = 0;
    for (const q of questionBank_js_1.QUESTION_BANK) {
        await db_js_1.prisma.question.upsert({
            where: { id: q.id },
            update: {
                title: q.title,
                story: q.story,
                problemStatement: q.problemStatement,
                inputFormat: q.inputFormat,
                outputFormat: q.outputFormat,
                constraints: q.constraints,
                examples: JSON.stringify(q.examples),
                difficulty: q.difficulty,
                topic: q.topic,
                pattern: q.pattern,
                expectedTimeComplexity: q.expectedTimeComplexity,
                expectedSpaceComplexity: q.expectedSpaceComplexity,
                timeLimit: q.timeLimit,
                memoryLimit: q.memoryLimit,
                starterCode: q.starterCode,
                visibleTests: JSON.stringify(q.visibleTests),
                hiddenTests: JSON.stringify(q.hiddenTests),
                edgeCases: JSON.stringify(q.edgeCases),
                tags: JSON.stringify(q.tags),
            },
            create: {
                id: q.id,
                title: q.title,
                story: q.story,
                problemStatement: q.problemStatement,
                inputFormat: q.inputFormat,
                outputFormat: q.outputFormat,
                constraints: q.constraints,
                examples: JSON.stringify(q.examples),
                difficulty: q.difficulty,
                topic: q.topic,
                pattern: q.pattern,
                expectedTimeComplexity: q.expectedTimeComplexity,
                expectedSpaceComplexity: q.expectedSpaceComplexity,
                timeLimit: q.timeLimit,
                memoryLimit: q.memoryLimit,
                starterCode: q.starterCode,
                visibleTests: JSON.stringify(q.visibleTests),
                hiddenTests: JSON.stringify(q.hiddenTests),
                edgeCases: JSON.stringify(q.edgeCases),
                tags: JSON.stringify(q.tags),
            },
        });
        count++;
    }
    console.log(`✅ Successfully seeded ${count} story-based questions into database.`);
}
seed()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await db_js_1.prisma.$disconnect();
});
