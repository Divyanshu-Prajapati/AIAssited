import { QuestionSpecification } from '../../types/QuestionSpecification.js';
import { GENERIC_JAVA_STARTER } from '../questionBank.js';

export const arr01Spec: QuestionSpecification = {
  problem: {
    id: 'arr_01',
    title: 'Warehouse Shipment Net Adjustment',
    story:
      'A global logistics warehouse records daily shipment adjustments as integers. Positive values represent excess stock received, while negative values represent dispatch deficits. The warehouse manager needs to find the maximum contiguous sum of adjustments over any continuous sub-period.',
    problemStatement:
      'Given an array of integers representing daily stock adjustments, find the maximum contiguous subarray sum.',
    inputFormat: 'Line 1: N (number of days)\nLine 2: N space-separated integers.',
    outputFormat: 'Print a single integer representing the maximum contiguous sub-period sum.',
    constraints: ['1 <= N <= 10^5', '-10^4 <= adjustments[i] <= 10^4'],
    examples: [
      {
        input: '8\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'Subarray [4, -1, 2, 1] gives maximum sum 6.',
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'Single element array.',
      },
      {
        input: '5\n5 4 -1 7 8',
        output: '23',
        explanation: 'Entire array gives sum 23.',
      },
    ],
    edgeCases: [
      {
        scenario: 'All negative numbers',
        input: '4\n-1 -2 -3 -4',
        expectedOutput: '-1',
        explanation: 'When all numbers are negative, return the single largest element.',
      },
      {
        scenario: 'Single element array',
        input: '1\n5',
        expectedOutput: '5',
        explanation: 'Single element array returns the value itself.',
      },
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
      concepts: [
        'best subarray ending at current position',
        'global best sum',
        'reset running sum when negative',
        'maximum contiguous sum',
      ],
      correctnessConditions: [
        'Updates current max sum using max(arr[i], currentMax + arr[i])',
        'Tracks global max sum across all iterations',
      ],
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
      correctnessConditions: [
        'Evaluates every continuous range [i..j]',
        'Updates global max sum for every range',
      ],
    },
  ],

  validation: {
    understanding: {
      requirements: [
        {
          id: 'req_u1',
          description: 'Identifies input array and output contiguous maximum sum contract',
          critical: true,
          category: 'Objective',
          concepts: ['contiguous subarray', 'maximum sum'],
          acceptableEvidence: [
            'find max contiguous sum',
            'calculate largest sub-period sum',
            'maximum subarray sum',
            'greatest contiguous total',
          ],
        },
        {
          id: 'req_u2',
          description: 'Recognizes handling of negative elements and single element bounds',
          critical: true,
          category: 'EdgeCases',
          concepts: ['all negative values', 'single element'],
          acceptableEvidence: [
            'if all numbers are negative return largest single element',
            'single element array sum is itself',
            'handles negative stock deficits',
          ],
        },
      ],
      minimumEdgeCases: 1,
      prohibitedMisunderstandings: [
        'Assuming non-contiguous elements can be selected',
        'Assuming array only contains positive numbers',
      ],
    },

    plan: {
      requirements: [
        {
          id: 'req_p1',
          description: 'Proposes tracking current subarray sum and global max sum',
          critical: true,
          category: 'Algorithm',
          concepts: ['running sum', 'global max'],
          acceptableEvidence: [
            'keep max ending at current index',
            'update overall max sum',
            'best subarray ending at current position',
            'global best sum',
          ],
        },
        {
          id: 'req_p2',
          description: 'Specifies O(N) time and O(1) space complexity bounds',
          critical: true,
          category: 'Complexity',
          concepts: ['linear time', 'constant space'],
          acceptableEvidence: ['O(N) time complexity', 'O(1) extra space', 'single linear pass'],
        },
      ],
      acceptedApproaches: [
        {
          id: 'kadane_linear_scan',
          name: 'Linear Scan with Running Maximum Subarray Sum',
          description: 'Single pass maintaining best sum ending at current element and overall global maximum.',
          correctness: 'CORRECT',
          optimal: true,
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)',
          concepts: [
            'best subarray ending at current position',
            'global best sum',
            'reset running sum when negative',
            'maximum contiguous sum',
          ],
          correctnessConditions: [
            'Updates current max sum using max(arr[i], currentMax + arr[i])',
            'Tracks global max sum across all iterations',
          ],
        },
      ],
      complexity: {
        expectedTime: 'O(N)',
        expectedSpace: 'O(1)',
        allowedTimeComplexities: ['O(N)', 'O(N^2)'],
        allowedSpaceComplexities: ['O(1)'],
        complexityJustification: 'Single linear scan maintains running max in O(N) time and O(1) space.',
      },
      allowCorrectButInefficient: true,
    },

    implementation: {
      requirements: [
        {
          id: 'req_i1',
          description: 'Iterates array updating running max sum and global max sum',
          critical: true,
          category: 'Implementation',
          concepts: ['for loop', 'max update'],
          acceptableEvidence: [
            'Math.max(arr[i], currentMax + arr[i])',
            'globalMax = Math.max(globalMax, currentMax)',
            'currentMax = Math.max(arr[i], currentMax + arr[i])',
          ],
        },
      ],
      requiredImplementationStages: [
        'Scanner input reading of N and array values',
        'State initialization of currentMax and globalMax with arr[0]',
        'Loop from 1 to N-1 updating currentMax and globalMax',
        'Print globalMax result',
      ],
      consistencyRules: [
        'Step 3 code structure must match the running max plan proposed in Step 2',
      ],
    },
  },

  consistency: {
    step1ToStep2: ['Step 2 plan must handle negative numbers identified in Step 1'],
    step2ToStep3: ['Step 3 implementation must match the running sum strategy proposed in Step 2'],
    step3ToCode: ['Generated Java code must initialize max variables and execute single pass'],
  },

  tests: {
    examples: [
      {
        id: 'ex_1',
        input: '8\n-2 1 -3 4 -1 2 1 -5 4',
        expectedOutput: '6',
        type: 'EXAMPLE',
        description: 'Standard mixed positive and negative values',
      },
    ],
    visible: [
      {
        id: 'v_1',
        input: '1\n1',
        expectedOutput: '1',
        type: 'VISIBLE',
        description: 'Single positive element',
      },
      {
        id: 'v_2',
        input: '5\n5 4 -1 7 8',
        expectedOutput: '23',
        type: 'VISIBLE',
        description: 'Entire array positive max sum',
      },
    ],
    hidden: [
      {
        id: 'h_1',
        input: '6\n0 0 0 0 0 0',
        expectedOutput: '0',
        type: 'HIDDEN',
        description: 'All zero adjustments',
      },
      {
        id: 'h_2',
        input: '5\n-10 20 -5 15 -30',
        expectedOutput: '30',
        type: 'HIDDEN',
        description: 'Subarray range [20, -5, 15] gives max sum 30',
      },
    ],
    edge: [
      {
        id: 'e_1',
        input: '4\n-1 -2 -3 -4',
        expectedOutput: '-1',
        type: 'EDGE',
        description: 'All negative adjustments return maximum single element',
      },
    ],
  },

  referenceSolutions: [
    {
      approachId: 'kadane_linear_scan',
      explanation: 'Linear scan maintaining running maximum subarray sum ending at current index and overall global maximum.',
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
};
