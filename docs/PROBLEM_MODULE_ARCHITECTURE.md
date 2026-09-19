# 🏗️ Problem Module & Shared Validation Engine Architecture

## 1. Architectural Philosophy

Every problem in the **DSA AI Assessment Lab** owns its **knowledge**, while the shared infrastructure owns the **behavior**:

```
Problem Module (ProblemSpecification + ValidationContract + TestSuite + ReferenceSolution)
        ↓
ProblemRegistry.get(problemId)
        ↓
ProblemValidationService / AIService
        ↓
Shared Validation Engine (Deterministic + Semantic + Consistency)
        ↓
DecisionEngine (Authoritative Outcome: PASS | FAIL | CORRECT_BUT_INEFFICIENT | INCONSISTENT | INSUFFICIENT_EVIDENCE)
        ↓
AssessmentStateMachine (Enforces State Transitions)
```

Instead of 118 duplicated controllers or procedural validation scripts, **ONE shared validation engine** handles all 118 problems.

---

## 2. Problem Module Interface (`ProblemModule.ts`)

```typescript
export type OutputValidationMode = 'EXACT' | 'NORMALIZED' | 'ANY_VALID' | 'CUSTOM';

export interface ProblemModule {
  specification: QuestionSpecification;
  outputValidationMode?: OutputValidationMode;
  customValidatorId?: string;
}
```

- **Declarative Knowledge**: accepted approaches, correctness conditions, time/space complexity bounds, step 1/2/3 validation requirements, prohibited misunderstandings, executable test suite.
- **Output Validation**: supports exact matching, whitespace normalization, multi-valid choices (`|`), and custom evaluation routines (e.g. `PEAK_INDEX`).

---

## 3. Custom Output Validators (`OutputValidatorRegistry.ts`)

For problems with non-unique correct outputs (such as `ARR-002: Peak Element Index` where `[1, 2, 1, 3, 5, 6, 4]` accepts index `1` or index `5`), exact string matching is insufficient.

The `OutputValidatorRegistry` routes custom validation logic:

```typescript
// ARR-002 Peak Element Index Custom Validator
private validatePeakIndex(input: string, expectedOutput: string, actualOutput: string): OutputValidationResult {
  // Verifies that 0 <= actualIdx < N and arr[idx] > arr[idx-1] && arr[idx] > arr[idx+1]
}
```

---

## 4. Problem Registry (`ProblemRegistry.ts`)

Centralized registry containing all 118 problem modules:

- `register(module: ProblemModule)`
- `get(problemId: string): ProblemModule | undefined`
- `getAll(): ProblemModule[]`
- `getByTopic(topic: DSATopic): ProblemModule[]`
- `validateRegistry()`: Validates exact 118 count, topic distribution, specification correctness, and reference solution readiness.

---

## 5. Execution & Seeding Workflow

1. `npm run db:seed`:
   - Validates `ProblemRegistry` integrity.
   - Audits all 118 specifications with `QuestionSpecificationValidator`.
   - Inserts or updates 118 `Question` rows in Prisma DB with `specificationStatus = 'VALIDATED'`.
2. Runtime (`QuestionSpecificationService.ts`):
   - Resolves specifications directly from `ProblemRegistry` or DB JSON `specification`.
   - Rejects unvalidated or legacy questions in `AI_ASSISTED` assessment mode.
