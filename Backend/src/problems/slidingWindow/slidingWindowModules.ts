import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const slidingWindowModules: ProblemModule[] = Array.from({ length: 8 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `SW-${num}`;
  return createProblemModule({
    id,
    title: `Telemetry Window Maximum Sum #${i + 1}`,
    story: `A streaming telemetry system monitors consecutive readings over a window of size K to detect maximum signal power.`,
    problemStatement: `Given an array of integers and a window size K, find the maximum sum of any contiguous subarray of size K.`,
    difficulty: i < 4 ? 'EASY' : 'MEDIUM',
    topic: 'Sliding Window',
    pattern: 'Fixed Size Sliding Window',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Fixed Window Slide & Accumulate',
    optimalConcepts: ['sliding window', 'window sum update', 'fixed size K'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        long[] arr = new long[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextLong();
        
        long windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += arr[i];
        
        long maxSum = windowSum;
        for (int i = k; i < n; i++) {
            windowSum += arr[i] - arr[i - k];
            maxSum = Math.max(maxSum, windowSum);
        }
        
        System.out.println(maxSum);
    }
}`,
    examples: [
      { input: '5 3\n2 1 5 1 3', output: '9', explanation: 'Window [5, 1, 3] gives sum 9.' },
      { input: '4 2\n1 4 2 10', output: '12', explanation: 'Window [2, 10] gives sum 12.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '3 1\n5 10 15', expectedOutput: '15', description: 'Window size 1' },
      { id: 'v_2', input: '4 4\n1 2 3 4', expectedOutput: '10', description: 'Window size equal to N' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '6 2\n-1 -2 10 20 -5 5', expectedOutput: '30', description: 'Window with negatives' },
      { id: 'h_2', input: '5 3\n0 0 0 0 0', expectedOutput: '0', description: 'All zeros' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1 1\n7', expectedOutput: '7', description: 'N=1 and K=1' },
    ],
  });
});
