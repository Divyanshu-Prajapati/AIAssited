# 📖 Question Specification Data Contract Architecture

## 1. Executive Summary & Authoritative Source of Truth

The **DSA AI Assessment Lab** is designed to evaluate a candidate's problem-solving workflow across 6 structured steps:
1. **Understand**
2. **Plan**
3. **Implement**
4. **Test**
5. **Debug**
6. **Submit**

A generic chatbot or simple test runner cannot determine whether a candidate truly understands a problem or whether their plan matches their implementation. To perform reliable, objective AI assessment evaluation without relying on rigid keyword matching, each DSA problem requires a strongly typed **Question Specification Data Contract** (`QuestionSpecification.ts`).

The `QuestionSpecification` serves as the **authoritative source of truth** for problem-specific assessment validation, AI prompts, decision engine evaluations, test suite execution, and solution generation.

---

## 2. Specification Status & Legacy Compatibility

The backend distinguishes between validated assessment specifications and legacy compatibility items:

- **`VALIDATED`**: Specification passes all 18 cross-field validation rules via `QuestionSpecificationValidator`. Suitable for AI-assisted multi-step candidate assessment (e.g. `arr_01`).
- **`LEGACY_UNVALIDATED`**: Questions lacking a complete validated specification (e.g. legacy questions in `questionBank.ts`). The adapter `QuestionSpecificationAdapter.ts` converts legacy questions into a compatibility shell marked `LEGACY_UNVALIDATED`.
- **`INVALID` / `DRAFT`**: Specifications under construction or failing schema rules.

> [!IMPORTANT]
> Generic placeholder questions (e.g., statements like *"perform efficient computation using Arrays"*) are explicitly classified as `LEGACY_UNVALIDATED` and **cannot** be used for problem-specific AI validation until replaced with fully validated specifications.

---

## 3. Database Persistence (`prisma/schema.prisma`)

Specification data is stored non-destructively in SQLite via Prisma:

```prisma
model Question {
  id                      String   @id @default(uuid())
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
  timeLimit               Int      @default(2000)
  memoryLimit             Int      @default(256)
  starterCode             String
  visibleTests            String
  hiddenTests             String
  edgeCases               String
  tags                    String
  specification           String?  @default("{}") // Full JSON QuestionSpecification
  specificationVersion    Int      @default(1)
  specificationStatus     String   @default("LEGACY_UNVALIDATED") // LEGACY_UNVALIDATED | VALIDATED | INVALID | DRAFT
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  attempts                Attempt[]
  sessions                AssessmentSession[]
}
```

---

## 4. Multi-Layer Validation Pipeline

Validation is handled by specialized layers:

```
REAL QUESTION SPECIFICATION
        ↓
VALIDATION CONTRACT (QuestionSpecificationValidator)
        ↓
DETERMINISTIC VALIDATION (DeterministicValidator)
        ↓
SEMANTIC VALIDATION (SemanticValidator)
        ↓
CROSS-STEP CONSISTENCY (ConsistencyValidator)
        ↓
DECISION ENGINE (DecisionEngine)
        ↓
BACKEND STATE MACHINE (AssessmentStateMachine)
        ↓
CODE GENERATION & COMPILATION GUARD
        ↓
TEST EXECUTION & SUBMISSION
```

### A. Deterministic Validator (`DeterministicValidator`)
Handles non-empty checks, length thresholds, complexity parsing, and prohibited misunderstandings (e.g., selecting non-contiguous elements in subarray sum).

### B. Semantic Validator (`SemanticValidator`)
Evaluates semantic concept equivalence instead of exact string matching. For example:
- Candidate says: *"maintain best subarray sum ending at current index"*
- System matches: **Kadane's algorithm concept** without requiring exact name match.

### C. Consistency Validator (`ConsistencyValidator`)
Ensures cross-step logical alignment:
- **Step 1 → Step 2**: Validates edge cases identified in Step 1 are addressed in Step 2.
- **Step 2 → Step 3**: Detects strategy and complexity mismatches (e.g., Step 2 specifies $O(1)$ space running sum, but Step 3 describes using an $O(N)$ HashMap).
- **Step 3 → Code**: Verifies generated code matches implementation description.

### D. Decision Engine (`DecisionEngine`)
Returns a structured `ValidationEvaluationResult`:
- `decision`: `'PASS'` | `'FAIL'` | `'CORRECT_BUT_INEFFICIENT'` | `'INCONSISTENT'` | `'INSUFFICIENT_EVIDENCE'`
- `score`: Supporting info only (missing critical requirements block `PASS` regardless of score).

---

## 5. Authoritative State Machine & Code Generation Guard

The `AssessmentStateMachine` enforces strict transition ordering:

```
PROBLEM_LOADED → UNDERSTANDING → UNDERSTANDING_REVIEW → PLAN → PLAN_REVIEW → IMPLEMENTATION → IMPLEMENTATION_REVIEW → CODE_GENERATING → CODE_READY → TESTING → DEBUGGING → SUBMITTING → EVALUATED → COMPLETED
```

### Code Generation Guard Policy:
1. Candidate passes Step 3 Implementation & Cross-Step Consistency checks.
2. Session transitions to `CODE_GENERATING`.
3. AI generates code from reasoning prompts.
4. Local JDK compiler compiles code. If compilation fails, status reverts to `IMPLEMENTATION_REVIEW` (does NOT become `CODE_READY`).
5. Only upon successful compilation does session transition to `CODE_READY`.

---

## 6. Test Suite Architecture

All test cases utilize standard `TestCase` schemas across 4 categories:
- `examples`: Sample test cases shown in problem statement.
- `visible`: Runnable by candidate during `TESTING` / `DEBUGGING`.
- `hidden`: Hidden test cases executed upon final `SUBMITTING`.
- `edge`: Boundary tests (all negative numbers, single element, zeros) executed during submission.

---

## 7. Keywords vs. Semantic Concepts

| Traditional Keyword Matching | Semantic Concept Model (This Specification) |
| :--- | :--- |
| Requires exact string `"Kadane"` | Accepts `"best subarray ending at current position"`, `"running sum"`, `"global best sum"` |
| Fails if candidate calls it `"running max"` | Passes because semantic concept matches underlying algorithm logic |
| Rigid and easily bypassed or failed | Robust, equitable evaluation of true candidate reasoning |

---

## 8. Correctness vs. Optimality

- **Correctness**: Whether candidate logic produces correct output for all valid inputs.
- **Optimality**: Whether approach achieves optimal time/space complexity bounds ($O(N)$ vs $O(N^2)$).

The `QuestionSpecification` models both optimal ($O(N)$) and correct-but-inefficient ($O(N^2)$) approaches, allowing the decision engine to output `CORRECT_BUT_INEFFICIENT` with constructive feedback.
