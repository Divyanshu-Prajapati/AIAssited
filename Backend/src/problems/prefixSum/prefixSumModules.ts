import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const prefixSumModules: ProblemModule[] = Array.from({ length: 8 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `PS-${num}`;
  return createProblemModule({
    id,
    title: `Financial Range Query Ledger #${i + 1}`,
    story: `A ledger system precomputes daily financial transaction totals to answer range sum queries efficiently.`,
    problemStatement: `Given an array of N integers and Q range queries (L, R) (1-based index), output the sum of elements from index L to R inclusive.`,
    difficulty: i < 4 ? 'EASY' : 'MEDIUM',
    topic: 'Prefix Sum',
    pattern: 'Prefix Sum Array Precomputation',
    expectedTimeComplexity: 'O(N + Q)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'Prefix Sum Query Precomputation',
    optimalConcepts: ['prefix sum array', 'range query O(1)', '1-based indexing'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int q = sc.nextInt();
        long[] pref = new long[n + 1];
        for (int i = 1; i <= n; i++) {
            pref[i] = pref[i - 1] + sc.nextLong();
        }
        
        for (int i = 0; i < q; i++) {
            int l = sc.nextInt();
            int r = sc.nextInt();
            System.out.println(pref[r] - pref[l - 1]);
        }
    }
}`,
    examples: [
      { input: '5 2\n1 2 3 4 5\n1 3\n2 5', output: '6\n14', explanation: 'Sum(1..3)=6, Sum(2..5)=14' },
      { input: '3 1\n10 20 30\n1 1', output: '10', explanation: 'Sum(1..1)=10' },
    ],
    visibleTests: [
      { id: 'v_1', input: '4 1\n2 4 6 8\n2 4', expectedOutput: '18', description: 'Range 2 to 4' },
      { id: 'v_2', input: '3 1\n5 5 5\n1 3', expectedOutput: '15', description: 'Entire array range' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '5 2\n-1 -2 3 4 -5\n1 2\n3 4', expectedOutput: '-3\n7', description: 'Negative range query' },
      { id: 'h_2', input: '4 1\n0 0 0 0\n1 4', expectedOutput: '0', description: 'Zero range query' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1 1\n100\n1 1', expectedOutput: '100', description: 'Single element range' },
    ],
  });
});
