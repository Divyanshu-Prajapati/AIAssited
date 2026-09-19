# 📖 Question Specification Data Contract Architecture

## 1. Why the Specification Exists

The **DSA AI Assessment Lab** is designed to evaluate a candidate's problem-solving workflow across 6 structured steps:
1. **Understand**
2. **Plan**
3. **Implement**
4. **Test**
5. **Debug**
6. **Submit**

A generic chatbot or simple test runner cannot determine whether a candidate truly understands a problem or whether their plan matches their implementation. To perform reliable, objective AI assessment evaluation without relying on rigid keyword matching, each DSA problem requires a strongly typed **Question Specification Data Contract** (`QuestionSpecification.ts`).

---

## 2. Problem Definition (`ProblemDefinition`)

Describes the core narrative, problem statement, input/output formats, constraints, examples, and edge case scenarios:

- **`id` & `title`**: Unique identifier and descriptive problem title.
- **`story`**: Real-world logistics or domain context (e.g. logistics warehouse shipment adjustments).
- **`problemStatement`**: Unambiguous DSA problem objective.
- **`inputFormat` & `outputFormat`**: Exact standard input and output specifications.
- **`constraints`**: Quantitative parameter bounds ($1 \le N \le 10^5$).
- **`examples` & `edgeCases`**: Concrete input/output pairs and edge condition scenarios.

---

## 3. Accepted Approaches (`AcceptedApproach`)

Defines all logically valid solutions for the problem. A problem may have multiple correct approaches:

- **Optimal Approach**: $O(N)$ linear scan with running max.
- **Sub-optimal / Inefficient Approach**: $O(N^2)$ brute force pair range check (which is correct but inefficient).

Key Fields:
- `correctness`: Must be `'CORRECT'`.
- `optimal`: Boolean indicating whether this approach achieves optimal complexity.
- `concepts`: Underlying DSA concepts (e.g., `["running sum", "global best sum"]`).
- `correctnessConditions`: Explicit logical criteria required for the approach to be valid.

---

## 4. Validation Requirements (`ValidationRequirement`)

Defines requirements for each reasoning step (Step 1 Understanding, Step 2 Plan, Step 3 Implementation):

- `critical`: Boolean indicating if failure to meet this requirement blocks step completion.
- `category`: Domain category (`Objective`, `EdgeCases`, `Algorithm`, `Complexity`, `Implementation`).
- `concepts`: Core semantic concepts expected in the candidate's explanation.
- `acceptableEvidence`: Example phrases representing valid candidate reasoning.
- `unacceptableEvidence`: Optional list of statements indicating misunderstanding.

---

## 5. Complexity Contract (`ComplexityContract`)

Defines time and space complexity expectations:
- `expectedTime` & `expectedSpace`: Target complexity (e.g. $O(N)$ time, $O(1)$ space).
- `allowedTimeComplexities` & `allowedSpaceComplexities`: List of accepted complexity bounds.
- `complexityJustification`: Technical reasoning explaining why the complexity bound is required.

---

## 6. Consistency Contract (`ConsistencyContract`)

Ensures cross-step logical alignment:
- `step1ToStep2`: Validates that constraints and edge cases identified in Step 1 are addressed in Step 2 algorithm plan.
- `step2ToStep3`: Validates that data structures and algorithm strategy in Step 3 match Step 2 proposal.
- `step3ToCode`: Validates that generated Java code executes the reasoning outlined in Step 3.

---

## 7. Test Suite (`QuestionTestSuite`)

Structured test cases categorized by type:
- `examples`: Sample test cases displayed in problem statement.
- `visible`: Tests runnable by candidate during Step 4 Testing.
- `hidden`: Hidden test cases executed upon final Step 6 Submission.
- `edge`: Specialized tests targeting boundary conditions (all negatives, single element, zeros).

---

## 8. Reference Solution (`ReferenceSolution`)

Complete, executable reference Java code linked to an `approachId`, with complexity metadata and explanation.

---

## 9. Difference Between Keywords vs. Semantic Concepts

| Traditional Keyword Matching | Semantic Concept Model (This Specification) |
| :--- | :--- |
| Requires exact string `"Kadane"` | Accepts `"best subarray ending at current position"`, `"running sum"`, `"global best sum"` |
| Fails if candidate calls it `"running max"` | Passes because semantic concept matches the underlying algorithm logic |
| Rigid and easily bypassed or failed | Robust, equitable evaluation of true candidate reasoning |

---

## 10. Difference Between Correctness vs. Optimality

- **Correctness**: Whether the candidate's logic produces the correct output for all valid inputs without breaking bounds.
- **Optimality**: Whether the candidate's approach achieves the best possible time and space complexity bounds ($O(N)$ vs $O(N^2)$).

The `QuestionSpecification` explicitly models both optimal ($O(N)$) and correct-but-inefficient ($O(N^2)$) approaches so the simulator can reward correct reasoning while providing constructive feedback on efficiency.
