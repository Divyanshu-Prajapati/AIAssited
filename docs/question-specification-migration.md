# 🗄️ Question Specification Database Storage & Future Migration Plan

## Executive Summary

The **Question Specification Data Contract** (`QuestionSpecification.ts`) introduces rich structured metadata for multi-step AI candidate validation (accepted approaches, correctness conditions, Step 1/2/3 validation contracts, consistency rules, and semantic evidence).

To maintain zero breaking changes and absolute backward compatibility:
- **No destructive database migration was performed during Step 2.**
- Existing database queries, Prisma schema models (`Question`, `AssessmentSession`, `Attempt`), and seed runners remain **100% operational**.
- An adapter (`QuestionSpecificationAdapter.ts`) seamlessly converts between `QuestionSpecification` objects and existing database `Question` entities.

---

## Current Storage (Adapter Coexistence)

Currently, `QuestionSpecificationAdapter.ts` maps `QuestionSpecification` data onto the existing `Question` model fields:

| `QuestionSpecification` Field | Existing `Question` Model Field | Format |
| :--- | :--- | :--- |
| `problem.id` | `id` | `String` |
| `problem.title` | `title` | `String` |
| `problem.story` | `story` | `String` |
| `problem.problemStatement` | `problemStatement` | `String` |
| `problem.inputFormat` | `inputFormat` | `String` |
| `problem.outputFormat` | `outputFormat` | `String` |
| `problem.constraints` | `constraints` | `String` (newline separated) |
| `problem.examples` | `examples` | `JSON.stringify(examples)` |
| `problem.difficulty` | `difficulty` | `String` |
| `problem.topic` | `topic` | `String` |
| `problem.pattern` | `pattern` | `String` |
| `problem.expectedTimeComplexity` | `expectedTimeComplexity` | `String` |
| `problem.expectedSpaceComplexity` | `expectedSpaceComplexity` | `String` |
| `tests.examples` + `tests.visible` | `visibleTests` | `JSON.stringify(visibleTests)` |
| `tests.hidden` + `tests.edge` | `hiddenTests` | `JSON.stringify(hiddenTests)` |
| `problem.edgeCases` | `edgeCases` | `JSON.stringify(edgeCases)` |
| `starterCode` | `starterCode` | `String` |

---

## Future Non-Destructive Schema Migration (Step 3+)

When full problem-specific validation is deployed in future steps, the full `QuestionSpecification` JSON payload will be persisted directly in Prisma.

### Proposed Prisma Schema Addition:

```prisma
model Question {
  id                      String              @id @default(uuid())
  title                   String
  story                   String
  problemStatement        String
  inputFormat             String
  outputFormat            String
  constraints             String
  examples                String
  difficulty              String
  topic                   String
  pattern                 String
  expectedTimeComplexity  String
  expectedSpaceComplexity String
  timeLimit               Int                 @default(2000)
  memoryLimit             Int                 @default(256)
  starterCode             String
  visibleTests            String
  hiddenTests             String
  edgeCases               String
  tags                    String
  specification           String?             @default("{}") // NEW: Full JSON payload for QuestionSpecification
  createdAt               DateTime            @default(now())
  updatedAt               DateTime            @updatedAt
  attempts                Attempt[]
  sessions                AssessmentSession[]
}
```

### Migration Execution Steps (Future):

1. **Add Optional Field**: Add `specification String? @default("{}")` to `prisma/schema.prisma`.
2. **Push Schema Change**: Run `npx prisma db push` (non-breaking, non-destructive).
3. **Populate Specs**: Update seed runner to store `JSON.stringify(spec)` into `specification` column for validated questions (`arr_01` and future real questions).
4. **Fallback Handling**: If `specification` is empty or `{}` for older questions, `legacyQuestionToSpec()` adapter converts legacy `Question` data on-the-fly.
