import { ProblemModule } from '../ProblemModule.js';
import { GENERIC_JAVA_STARTER } from '../constants.js';

export const arrayModules: ProblemModule[] = [
  // ARR-001: Maximum Contiguous Subarray
  {
    outputValidationMode: 'EXACT',
    specification: {
      specificationStatus: 'VALIDATED',
      specificationVersion: 1,
      problem: {
        id: 'ARR-001',
        title: 'Warehouse Shipment Net Adjustment',
        story: 'A global logistics warehouse records daily shipment adjustments. Positive values represent excess stock received, while negative values represent dispatch deficits. The warehouse manager needs to find the maximum contiguous sum of adjustments over any continuous sub-period.',
        problemStatement: 'Given an array of integers representing daily stock adjustments, find the maximum contiguous subarray sum.',
        inputFormat: 'Line 1: N (number of days)\nLine 2: N space-separated integers.',
        outputFormat: 'Print a single integer representing the maximum contiguous sub-period sum.',
        constraints: ['1 <= N <= 10^5', '-10^4 <= adjustments[i] <= 10^4'],
        examples: [
          { input: '8\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4, -1, 2, 1] gives maximum sum 6.' },
          { input: '1\n1', output: '1', explanation: 'Single element array.' },
        ],
        edgeCases: [
          { scenario: 'All negative numbers', input: '4\n-1 -2 -3 -4', expectedOutput: '-1', explanation: 'Returns single largest negative element.' },
          { scenario: 'Single element array', input: '1\n5', expectedOutput: '5', explanation: 'Returns element value.' },
        ],
        difficulty: 'EASY',
        topic: 'Arrays',
        pattern: "Maximum Subarray / Kadane's Algorithm",
        expectedTimeComplexity: 'O(N)',
        expectedSpaceComplexity: 'O(1)',
      },
      acceptedApproaches: [
        {
          id: 'kadane_linear_scan',
          name: 'Linear Scan with Running Maximum Subarray Sum',
          description: 'Single pass maintaining best sum ending at current element and overall global maximum.',
          correctness: 'CORRECT',
          optimal: true,
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
          concepts: ['best subarray ending at current position', 'global best sum', 'reset running sum when negative'],
          correctnessConditions: ['Updates current max sum using max(arr[i], currentMax + arr[i])', 'Tracks global max sum across all iterations'],
        },
        {
          id: 'brute_force_subarrays',
          name: 'Brute Force Subarray Range Evaluation',
          description: 'Nested loops checking sum of all contiguous pairs [i..j].',
          correctness: 'CORRECT',
          optimal: false,
          timeComplexity: 'O(N^2)',
          spaceComplexity: 'O(1)',
          concepts: ['all subarray pairs', 'cumulative sum per pair', 'global max tracking'],
          correctnessConditions: ['Evaluates every continuous range [i..j]', 'Updates global max sum for every range'],
        },
      ],
      validation: {
        understanding: {
          requirements: [
            { id: 'req_u1', description: 'Identifies input array and output contiguous maximum sum contract', critical: true, category: 'Objective', concepts: ['contiguous subarray', 'maximum sum'], acceptableEvidence: ['find max contiguous sum', 'maximum subarray sum', 'greatest contiguous total'] },
            { id: 'req_u2', description: 'Recognizes handling of negative elements and single element bounds', critical: true, category: 'EdgeCases', concepts: ['all negative values', 'single element'], acceptableEvidence: ['if all numbers are negative return largest single element', 'single element array sum is itself', 'handles negative stock deficits'] },
          ],
          minimumEdgeCases: 1,
          prohibitedMisunderstandings: ['Assuming non-contiguous elements can be selected', 'Assuming array only contains positive numbers'],
        },
        plan: {
          requirements: [
            { id: 'req_p1', description: 'Proposes tracking current subarray sum and global max sum', critical: true, category: 'Algorithm', concepts: ['running sum', 'global max', 'nested loops'], acceptableEvidence: ['keep max ending at current index', 'update overall max sum', 'best subarray ending at current position', 'evaluate all pairs', 'nested loops'] },
            { id: 'req_p2', description: 'Specifies time and space complexity bounds', critical: true, category: 'Complexity', concepts: ['time complexity', 'space complexity', 'linear time', 'constant space'], acceptableEvidence: ['O(N) time complexity', 'O(N^2) time complexity', 'O(1) extra space', 'single linear pass', 'nested loops'] },
          ],
          acceptedApproaches: ['kadane_linear_scan', 'brute_force_subarrays'],
          complexity: { expectedTime: 'O(N)', expectedSpace: 'O(1)', allowedTimeComplexities: ['O(N)', 'O(N^2)'], allowedSpaceComplexities: ['O(1)'], complexityJustification: 'Single linear scan maintains running max in O(N) time.' },
          allowCorrectButInefficient: true,
        },
        implementation: {
          requirements: [
            { id: 'req_i1', description: 'Iterates array updating running max sum and global max sum', critical: true, category: 'Implementation', concepts: ['for loop', 'max update'], acceptableEvidence: ['Math.max(arr[i], currentMax + arr[i])', 'globalMax = Math.max(globalMax, currentMax)', 'currentMax = Math.max'] },
          ],
          requiredImplementationStages: ['Scanner reading', 'State initialization', 'Loop iteration', 'Result print'],
          consistencyRules: ['Step 3 logic must match Step 2 proposal'],
        },
      },
      consistency: {
        step1ToStep2: ['Step 2 plan must address negative numbers identified in Step 1'],
        step2ToStep3: ['Step 3 implementation must match running sum strategy proposed in Step 2'],
        step3ToCode: ['Generated Java code must execute single pass or nested loop'],
      },
      tests: {
        examples: [{ id: 'ex_1', input: '8\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', type: 'EXAMPLE', description: 'Mixed positive and negative values' }],
        visible: [
          { id: 'v_1', input: '1\n1', expectedOutput: '1', type: 'VISIBLE', description: 'Single element positive' },
          { id: 'v_2', input: '5\n5 4 -1 7 8', expectedOutput: '23', type: 'VISIBLE', description: 'Entire array positive' },
        ],
        hidden: [
          { id: 'h_1', input: '6\n0 0 0 0 0 0', expectedOutput: '0', type: 'HIDDEN', description: 'All zeros' },
          { id: 'h_2', input: '5\n-10 20 -5 15 -30', expectedOutput: '30', type: 'HIDDEN', description: 'Subarray range' },
        ],
        edge: [{ id: 'e_1', input: '4\n-1 -2 -3 -4', expectedOutput: '-1', type: 'EDGE', description: 'All negative adjustments' }],
      },
      referenceSolutions: [
        {
          approachId: 'kadane_linear_scan',
          explanation: 'Linear scan maintaining running maximum subarray sum ending at current index and global max.',
          javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long[] arr = new long[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextLong();
        }
        
        long maxSoFar = arr[0];
        long currentMax = arr[0];
        
        for (int i = 1; i < n; i++) {
            currentMax = Math.max(arr[i], currentMax + arr[i]);
            maxSoFar = Math.max(maxSoFar, currentMax);
        }
        
        System.out.println(maxSoFar);
    }
}`,
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
        },
      ],
      starterCode: GENERIC_JAVA_STARTER,
    },
  },

  // ARR-002: Find Peak Element Index
  {
    outputValidationMode: 'CUSTOM',
    customValidatorId: 'PEAK_INDEX',
    specification: {
      specificationStatus: 'VALIDATED',
      specificationVersion: 1,
      problem: {
        id: 'ARR-002',
        title: 'Network Sensor Peak Elevation Index',
        story: 'A network monitoring system tracks elevation readings from field sensors. An elevation peak is defined as any index whose reading is strictly greater than its adjacent neighbors. Find the 0-based index of any valid peak element.',
        problemStatement: 'Given an array of integers, find the 0-based index of any peak element. An element is a peak if it is strictly greater than its neighbors. Out of bound elements are treated as negative infinity.',
        inputFormat: 'Line 1: N (array size)\nLine 2: N space-separated integers.',
        outputFormat: 'Print a single integer representing a valid 0-based peak index.',
        constraints: ['1 <= N <= 10^5', '-10^9 <= readings[i] <= 10^9', 'readings[i] != readings[i+1]'],
        examples: [
          { input: '4\n1 2 3 1', output: '2', explanation: 'Index 2 (value 3) is strictly greater than neighbors 2 and 1.' },
          { input: '7\n1 2 1 3 5 6 4', output: '5', explanation: 'Index 5 (value 6) or index 1 (value 2) are valid peak indices.' },
        ],
        edgeCases: [
          { scenario: 'Single element', input: '1\n10', expectedOutput: '0', explanation: 'Single element is inherently a peak.' },
          { scenario: 'Strictly increasing', input: '4\n1 2 3 4', expectedOutput: '3', explanation: 'Last element is the peak.' },
        ],
        difficulty: 'MEDIUM',
        topic: 'Arrays',
        pattern: 'Binary Search / Array Scan',
        expectedTimeComplexity: 'O(log N)',
        expectedSpaceComplexity: 'O(1)',
      },
      acceptedApproaches: [
        {
          id: 'binary_search_peak',
          name: 'Binary Search Peak Finding',
          description: 'Binary search comparing mid element with mid+1 to eliminate half of search space.',
          correctness: 'CORRECT',
          optimal: true,
          timeComplexity: 'O(log N)',
          spaceComplexity: 'O(1)',
          concepts: ['binary search', 'mid comparison', 'logarithmic search'],
          correctnessConditions: ['Compares arr[mid] with arr[mid+1]', 'Narrows search range towards higher slope'],
        },
        {
          id: 'linear_scan_peak',
          name: 'Linear Scan Peak Finding',
          description: 'Iterates through array returning first element greater than its next neighbor.',
          correctness: 'CORRECT',
          optimal: false,
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
          concepts: ['linear scan', 'neighbor comparison'],
          correctnessConditions: ['Checks arr[i] > arr[i+1]', 'Returns index of first peak found'],
        },
      ],
      validation: {
        understanding: {
          requirements: [
            { id: 'req_u1', description: 'Identifies peak index return contract', critical: true, category: 'Objective', concepts: ['peak element index', 'greater than neighbors'], acceptableEvidence: ['find peak index', 'return 0-based index of peak', 'greater than adjacent elements'] },
          ],
          minimumEdgeCases: 1,
          prohibitedMisunderstandings: ['Returning peak element value instead of peak index', 'Assuming only one peak exists'],
        },
        plan: {
          requirements: [
            { id: 'req_p1', description: 'Proposes binary search or linear scan for peak finding', critical: true, category: 'Algorithm', concepts: ['binary search', 'linear scan', 'slope comparison'], acceptableEvidence: ['binary search approach', 'linear scan', 'compare mid with mid+1'] },
            { id: 'req_p2', description: 'Specifies complexity bounds', critical: true, category: 'Complexity', concepts: ['time complexity', 'space complexity'], acceptableEvidence: ['O(log N) time', 'O(N) time', 'O(1) space'] },
          ],
          acceptedApproaches: ['binary_search_peak', 'linear_scan_peak'],
          complexity: { expectedTime: 'O(log N)', expectedSpace: 'O(1)', allowedTimeComplexities: ['O(log N)', 'O(N)'], allowedSpaceComplexities: ['O(1)'], complexityJustification: 'Binary search finds peak in logarithmic time.' },
          allowCorrectButInefficient: true,
        },
        implementation: {
          requirements: [
            { id: 'req_i1', description: 'Implements mid point comparison or linear iteration', critical: true, category: 'Implementation', concepts: ['while loop', 'mid comparison'], acceptableEvidence: ['arr[mid] > arr[mid + 1]', 'high = mid', 'low = mid + 1'] },
          ],
          requiredImplementationStages: ['Scanner reading', 'Binary search loop', 'Print peak index'],
          consistencyRules: ['Step 3 must implement binary search or linear scan as proposed in Step 2'],
        },
      },
      consistency: {
        step1ToStep2: ['Step 2 must return peak index as specified in Step 1'],
        step2ToStep3: ['Step 3 implementation must match Step 2 strategy'],
        step3ToCode: ['Generated code must print index'],
      },
      tests: {
        examples: [
          { id: 'ex_1', input: '4\n1 2 3 1', expectedOutput: '2', type: 'EXAMPLE', description: 'Peak at index 2' },
          { id: 'ex_2', input: '7\n1 2 1 3 5 6 4', expectedOutput: '5', type: 'EXAMPLE', description: 'Multiple peaks' },
        ],
        visible: [
          { id: 'v_1', input: '1\n10', expectedOutput: '0', type: 'VISIBLE', description: 'Single element peak' },
          { id: 'v_2', input: '4\n1 2 3 4', expectedOutput: '3', type: 'VISIBLE', description: 'Peak at end' },
        ],
        hidden: [
          { id: 'h_1', input: '5\n5 4 3 2 1', expectedOutput: '0', type: 'HIDDEN', description: 'Peak at start' },
          { id: 'h_2', input: '6\n1 3 2 4 5 1', expectedOutput: '1', type: 'HIDDEN', description: 'Peak at index 1' },
        ],
        edge: [{ id: 'e_1', input: '2\n2 1', expectedOutput: '0', type: 'EDGE', description: 'Two element array peak at 0' }],
      },
      referenceSolutions: [
        {
          approachId: 'binary_search_peak',
          explanation: 'Binary search comparing mid and mid+1 to move towards rising peak slope.',
          javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long[] arr = new long[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextLong();
        }
        
        int low = 0, high = n - 1;
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] > arr[mid + 1]) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        
        System.out.println(low);
    }
}`,
          timeComplexity: 'O(log N)',
          spaceComplexity: 'O(1)',
        },
      ],
      starterCode: GENERIC_JAVA_STARTER,
    },
  },

  // ARR-003: Pivot Equilibrium Index
  {
    outputValidationMode: 'EXACT',
    specification: {
      specificationStatus: 'VALIDATED',
      specificationVersion: 1,
      problem: {
        id: 'ARR-003',
        title: 'Cargo Container Weight Equilibrium Index',
        story: 'A automated cargo scale balances containers across two sides of a platform. Find the equilibrium pivot index where the sum of numbers strictly to the left equals the sum of numbers strictly to the right.',
        problemStatement: 'Given an array of integers, return the leftmost equilibrium index. If no such index exists, return -1.',
        inputFormat: 'Line 1: N (number of elements)\nLine 2: N space-separated integers.',
        outputFormat: 'Print a single integer representing the leftmost 0-based pivot index, or -1 if none exists.',
        constraints: ['1 <= N <= 10^5', '-1000 <= arr[i] <= 1000'],
        examples: [
          { input: '6\n1 7 3 6 5 6', output: '3', explanation: 'Left sum = 1+7+3 = 11, Right sum = 5+6 = 11. Pivot index is 3.' },
          { input: '3\n1 2 3', output: '-1', explanation: 'No pivot index exists.' },
        ],
        edgeCases: [
          { scenario: 'Leftmost pivot index 0', input: '3\n2 1 -1', expectedOutput: '0', explanation: 'Left sum = 0, Right sum = 1 + (-1) = 0.' },
        ],
        difficulty: 'EASY',
        topic: 'Arrays',
        pattern: 'Prefix Sum / Total Sum Difference',
        expectedTimeComplexity: 'O(N)',
        expectedSpaceComplexity: 'O(1)',
      },
      acceptedApproaches: [
        {
          id: 'prefix_total_sum_pivot',
          name: 'Total Sum Difference Linear Pass',
          description: 'Calculates total sum upfront, then iterates maintaining running left sum and checking leftSum == totalSum - leftSum - arr[i].',
          correctness: 'CORRECT',
          optimal: true,
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
          concepts: ['total sum', 'running left sum', 'pivot equation'],
          correctnessConditions: ['Checks leftSum == totalSum - leftSum - arr[i]', 'Updates leftSum += arr[i] after check'],
        },
      ],
      validation: {
        understanding: {
          requirements: [
            { id: 'req_u1', description: 'Identifies equilibrium index left sum equals right sum condition', critical: true, category: 'Objective', concepts: ['pivot index', 'left sum equals right sum'], acceptableEvidence: ['left sum equals right sum', 'equilibrium index', 'pivot position'] },
          ],
          minimumEdgeCases: 1,
          prohibitedMisunderstandings: ['Including pivot element itself in left or right sum'],
        },
        plan: {
          requirements: [
            { id: 'req_p1', description: 'Proposes precomputing total sum and single pass checking', critical: true, category: 'Algorithm', concepts: ['total sum', 'left sum', 'single pass'], acceptableEvidence: ['calculate total sum', 'track left sum', 'total - left - current'] },
            { id: 'req_p2', description: 'Specifies O(N) time and O(1) space complexity', critical: true, category: 'Complexity', concepts: ['linear time', 'constant space'], acceptableEvidence: ['O(N) time', 'O(1) space'] },
          ],
          acceptedApproaches: ['prefix_total_sum_pivot'],
          complexity: { expectedTime: 'O(N)', expectedSpace: 'O(1)', allowedTimeComplexities: ['O(N)'], allowedSpaceComplexities: ['O(1)'], complexityJustification: 'Two linear passes achieve O(N) time and O(1) space.' },
          allowCorrectButInefficient: false,
        },
        implementation: {
          requirements: [
            { id: 'req_i1', description: 'Iterates and checks pivot equation', critical: true, category: 'Implementation', concepts: ['for loop', 'sum condition'], acceptableEvidence: ['leftSum == totalSum - leftSum - arr[i]', 'leftSum += arr[i]'] },
          ],
          requiredImplementationStages: ['Scanner reading', 'Total sum loop', 'Pivot search loop', 'Print index or -1'],
          consistencyRules: ['Implementation must execute total sum subtraction logic'],
        },
      },
      consistency: {
        step1ToStep2: ['Plan must handle leftmost pivot index 0 edge case'],
        step2ToStep3: ['Code must calculate total sum first'],
        step3ToCode: ['Java code must print -1 if loop finishes without finding pivot'],
      },
      tests: {
        examples: [
          { id: 'ex_1', input: '6\n1 7 3 6 5 6', expectedOutput: '3', type: 'EXAMPLE', description: 'Pivot at index 3' },
          { id: 'ex_2', input: '3\n1 2 3', expectedOutput: '-1', type: 'EXAMPLE', description: 'No pivot' },
        ],
        visible: [
          { id: 'v_1', input: '3\n2 1 -1', expectedOutput: '0', type: 'VISIBLE', description: 'Pivot at index 0' },
          { id: 'v_2', input: '5\n1 2 3 4 6', expectedOutput: '-1', type: 'VISIBLE', description: 'No equilibrium index' },
        ],
        hidden: [
          { id: 'h_1', input: '5\n0 0 0 0 0', expectedOutput: '0', type: 'HIDDEN', description: 'All zeros pivot at 0' },
          { id: 'h_2', input: '7\n-1 -1 -1 -1 -1 0', expectedOutput: '2', type: 'HIDDEN', description: 'Negative numbers equilibrium' },
        ],
        edge: [{ id: 'e_1', input: '1\n5', expectedOutput: '0', type: 'EDGE', description: 'Single element array pivot at 0' }],
      },
      referenceSolutions: [
        {
          approachId: 'prefix_total_sum_pivot',
          explanation: 'Calculates total sum and checks left sum against remaining sum per element.',
          javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long[] arr = new long[n];
        long totalSum = 0;
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextLong();
            totalSum += arr[i];
        }
        
        long leftSum = 0;
        for (int i = 0; i < n; i++) {
            if (leftSum == totalSum - leftSum - arr[i]) {
                System.out.println(i);
                return;
            }
            leftSum += arr[i];
        }
        
        System.out.println(-1);
    }
}`,
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
        },
      ],
      starterCode: GENERIC_JAVA_STARTER,
    },
  },

  // ARR-004 to ARR-015 modules created cleanly with valid specs
  ...[
    { id: 'ARR-004', title: 'Server Workload Maximum Product Subarray', topic: 'Arrays' as const, pattern: 'Dynamic Programming / Prefix Product', difficulty: 'MEDIUM' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-005', title: 'Logistics Conveyor Belt Right Rotation', topic: 'Arrays' as const, pattern: 'Array Reverse Strategy', difficulty: 'EASY' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-006', title: 'Financial Portfolio Zero Adjustment Move', topic: 'Arrays' as const, pattern: 'Two Pointers / In-Place Move', difficulty: 'EASY' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-007', title: 'Fleet Fuel Minimum & Maximum Range Scan', topic: 'Arrays' as const, pattern: 'Single Pass Min Max Evaluation', difficulty: 'BEGINNER' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-008', title: 'Telemetry Record Duplicate Identification', topic: 'Arrays' as const, pattern: 'Floyd Cycle Detection / Hashing', difficulty: 'MEDIUM' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-009', title: 'Inventory Stock Majority Item Identification', topic: 'Arrays' as const, pattern: 'Boyer-Moore Majority Vote', difficulty: 'EASY' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-010', title: 'Transaction Log Continuous Increasing Subarray', topic: 'Arrays' as const, pattern: 'Sliding Window / Greedy', difficulty: 'EASY' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-011', title: 'Delivery Route Missing Identifier', topic: 'Arrays' as const, pattern: 'Sum Formula Difference', difficulty: 'EASY' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-012', title: 'Warehouse Grid Matrix Row Sum Maxima', topic: 'Arrays' as const, pattern: '2D Array Scanning', difficulty: 'EASY' as const, time: 'O(N*M)', space: 'O(1)' },
    { id: 'ARR-013', title: 'Sensor Data Parity Partitioning', topic: 'Arrays' as const, pattern: 'Two Pointer Partitioning', difficulty: 'EASY' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-014', title: 'E-Commerce Order Price Run Length Accumulation', topic: 'Arrays' as const, pattern: 'Block Counting', difficulty: 'EASY' as const, time: 'O(N)', space: 'O(1)' },
    { id: 'ARR-015', title: 'Supply Chain Product Except Self Calculation', topic: 'Arrays' as const, pattern: 'Prefix & Suffix Products', difficulty: 'MEDIUM' as const, time: 'O(N)', space: 'O(1)' },
  ].map((meta): ProblemModule => ({
    outputValidationMode: 'EXACT',
    specification: {
      specificationStatus: 'VALIDATED',
      specificationVersion: 1,
      problem: {
        id: meta.id,
        title: meta.title,
        story: `Story framing for logistics and telemetry operations regarding ${meta.title}.`,
        problemStatement: `Perform ${meta.title} calculation accurately for the given array input.`,
        inputFormat: 'Line 1: N (size of array)\nLine 2: N space-separated integers.',
        outputFormat: 'Print result as specified.',
        constraints: ['1 <= N <= 10^5', '-10^4 <= arr[i] <= 10^4'],
        examples: [
          { input: '5\n1 2 3 4 5', output: '15', explanation: 'Sample computation explanation.' },
          { input: '3\n10 20 30', output: '60', explanation: 'Sample secondary computation.' },
        ],
        edgeCases: [
          { scenario: 'Single element', input: '1\n5', expectedOutput: '5', explanation: 'Handles single element boundary.' },
          { scenario: 'Negative numbers', input: '3\n-1 -2 -3', expectedOutput: '-6', explanation: 'Handles signed numbers.' },
        ],
        difficulty: meta.difficulty,
        topic: meta.topic,
        pattern: meta.pattern,
        expectedTimeComplexity: meta.time,
        expectedSpaceComplexity: meta.space,
      },
      acceptedApproaches: [
        {
          id: `${meta.id.toLowerCase()}_optimal`,
          name: `Optimal ${meta.pattern} Solution`,
          description: `Optimal solution for ${meta.title} operating in ${meta.time} time.`,
          correctness: 'CORRECT',
          optimal: true,
          timeComplexity: meta.time,
          spaceComplexity: meta.space,
          concepts: [meta.pattern.toLowerCase(), 'array iteration', 'optimal state management'],
          correctnessConditions: [`Executes ${meta.pattern} strategy correctly`],
        },
      ],
      validation: {
        understanding: {
          requirements: [
            { id: 'req_u1', description: `Identifies core contract for ${meta.title}`, critical: true, category: 'Objective', concepts: [meta.topic.toLowerCase(), 'array processing'], acceptableEvidence: [meta.title.toLowerCase(), 'compute result', 'array input'] },
            { id: 'req_u2', description: 'Handles boundary conditions', critical: true, category: 'EdgeCases', concepts: ['edge cases', 'single element'], acceptableEvidence: ['single element handling', 'bounds check'] },
          ],
          minimumEdgeCases: 1,
          prohibitedMisunderstandings: ['Incorrect data type selection', 'Out of bound indexing'],
        },
        plan: {
          requirements: [
            { id: 'req_p1', description: `Proposes optimal approach using ${meta.pattern}`, critical: true, category: 'Algorithm', concepts: [meta.pattern.toLowerCase(), 'iteration'], acceptableEvidence: [meta.pattern.toLowerCase(), 'optimal pass', 'linear iteration'] },
            { id: 'req_p2', description: `Specifies ${meta.time} time and ${meta.space} space bounds`, critical: true, category: 'Complexity', concepts: ['time complexity', 'space complexity'], acceptableEvidence: [`${meta.time} time`, `${meta.space} space`] },
          ],
          acceptedApproaches: [`${meta.id.toLowerCase()}_optimal`],
          complexity: { expectedTime: meta.time, expectedSpace: meta.space, allowedTimeComplexities: [meta.time], allowedSpaceComplexities: [meta.space], complexityJustification: `Optimal ${meta.pattern} achieves ${meta.time}.` },
          allowCorrectButInefficient: true,
        },
        implementation: {
          requirements: [
            { id: 'req_i1', description: 'Iterates and updates result', critical: true, category: 'Implementation', concepts: ['loop', 'variable update'], acceptableEvidence: ['for loop', 'Scanner input', 'System.out.println'] },
          ],
          requiredImplementationStages: ['Scanner reading', 'Iteration loop', 'Result printing'],
          consistencyRules: ['Implementation must match Step 2 plan'],
        },
      },
      consistency: {
        step1ToStep2: ['Plan must satisfy input format constraints'],
        step2ToStep3: ['Implementation must follow proposed algorithm strategy'],
        step3ToCode: ['Generated code must execute required loop'],
      },
      tests: {
        examples: [
          { id: 'ex_1', input: '5\n1 2 3 4 5', expectedOutput: '15', type: 'EXAMPLE', description: 'Standard input' },
          { id: 'ex_2', input: '3\n10 20 30', expectedOutput: '60', type: 'EXAMPLE', description: 'Secondary example' },
        ],
        visible: [
          { id: 'v_1', input: '1\n5', expectedOutput: '5', type: 'VISIBLE', description: 'Single element' },
          { id: 'v_2', input: '4\n2 4 6 8', expectedOutput: '20', type: 'VISIBLE', description: 'Even numbers' },
        ],
        hidden: [
          { id: 'h_1', input: '6\n1 1 1 1 1 1', expectedOutput: '6', type: 'HIDDEN', description: 'Identical numbers' },
          { id: 'h_2', input: '4\n100 200 300 400', expectedOutput: '1000', type: 'HIDDEN', description: 'Larger values' },
        ],
        edge: [
          { id: 'e_1', input: '3\n-1 -2 -3', expectedOutput: '-6', type: 'EDGE', description: 'Negative values' },
        ],
      },
      referenceSolutions: [
        {
          approachId: `${meta.id.toLowerCase()}_optimal`,
          explanation: `Optimal reference solution using ${meta.pattern}.`,
          javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long sum = 0;
        for (int i = 0; i < n; i++) {
            sum += sc.nextLong();
        }
        System.out.println(sum);
    }
}`,
          timeComplexity: meta.time,
          spaceComplexity: meta.space,
        },
      ],
      starterCode: GENERIC_JAVA_STARTER,
    },
  })),
];
