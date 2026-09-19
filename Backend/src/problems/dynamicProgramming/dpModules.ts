import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const dpModules: ProblemModule[] = Array.from({ length: 6 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `DP-${num}`;
  return createProblemModule({
    id,
    title: `Resource Allocation Dynamic Optimization #${i + 1}`,
    story: `A cloud resource manager computes optimal cost allocation using 1D/2D dynamic programming memoization.`,
    problemStatement: `Given N items each with cost and value, and capacity W, compute maximum value achievable (0/1 Knapsack / DP).`,
    difficulty: i < 3 ? 'MEDIUM' : 'HARD',
    topic: 'Dynamic Programming',
    pattern: 'Memoization & Tabulation',
    expectedTimeComplexity: 'O(N * W)',
    expectedSpaceComplexity: 'O(W)',
    optimalApproachName: '1D DP Tabulation Array Optimization',
    optimalConcepts: ['dynamic programming', 'tabulation', 'optimal substructure'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int w = sc.nextInt();
        int[] weights = new int[n];
        int[] values = new int[n];
        for (int i = 0; i < n; i++) weights[i] = sc.nextInt();
        for (int i = 0; i < n; i++) values[i] = sc.nextInt();
        
        long[] dp = new long[w + 1];
        for (int i = 0; i < n; i++) {
            for (int j = w; j >= weights[i]; j--) {
                dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
            }
        }
        System.out.println(dp[w]);
    }
}`,
    examples: [
      { input: '3 4\n1 2 3\n10 15 40', output: '55', explanation: 'Select items 1 and 3 (weight 1+3=4, value 10+40=50, or item 2+3=55)' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1 5\n5\n100', expectedOutput: '100', description: 'Single item exact fit' },
      { id: 'v_2', input: '2 3\n1 2\n10 20', expectedOutput: '30', description: 'Two items full fit' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '4 5\n2 1 3 2\n12 10 20 15', expectedOutput: '37', description: 'Optimal combination' },
      { id: 'h_2', input: '3 10\n3 4 5\n30 50 60', expectedOutput: '110', description: 'Three items dynamic fit' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1 0\n5\n100', expectedOutput: '0', description: 'Zero capacity' },
    ],
  });
});
