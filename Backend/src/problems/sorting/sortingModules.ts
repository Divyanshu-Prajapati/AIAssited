import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const sortingModules: ProblemModule[] = Array.from({ length: 6 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `SORT-${num}`;
  return createProblemModule({
    id,
    title: `Cargo Weight Sorting Pipeline #${i + 1}`,
    story: `An automated logistics sorter arranges incoming cargo containers in non-decreasing weight order.`,
    problemStatement: `Given an array of N integers, sort the array in non-decreasing order and print space-separated elements.`,
    difficulty: i < 3 ? 'EASY' : 'MEDIUM',
    topic: 'Sorting',
    pattern: 'Comparison Based Sorting',
    expectedTimeComplexity: 'O(N log N)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'Arrays.sort Dual-Pivot Quicksort / TimSort',
    optimalConcepts: ['sorting', 'non-decreasing order', 'n log n complexity'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long[] arr = new long[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextLong();
        
        Arrays.sort(arr);
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`,
    examples: [
      { input: '5\n5 2 3 1 4', output: '1 2 3 4 5', explanation: 'Array sorted in non-decreasing order.' },
      { input: '3\n10 -5 0', output: '-5 0 10', explanation: 'Negative numbers sorted correctly.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1\n42', expectedOutput: '42', description: 'Single element sort' },
      { id: 'v_2', input: '3\n3 2 1', expectedOutput: '1 2 3', description: 'Reverse sorted input' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '4\n0 0 0 0', expectedOutput: '0 0 0 0', description: 'All zeros' },
      { id: 'h_2', input: '5\n10 5 10 5 10', expectedOutput: '5 5 10 10 10', description: 'Duplicate elements' },
    ],
    edgeTests: [
      { id: 'e_1', input: '2\n-100 -200', expectedOutput: '-200 -100', description: 'Two negative elements' },
    ],
  });
});
