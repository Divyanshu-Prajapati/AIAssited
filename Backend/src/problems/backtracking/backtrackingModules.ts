import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const backtrackingModules: ProblemModule[] = Array.from({ length: 2 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `BT-${num}`;
  return createProblemModule({
    id,
    title: `Combinatorial Subsets Generation #${i + 1}`,
    story: `A product recommendation engine generates all possible bundle subsets of items using backtracking.`,
    problemStatement: `Given an array of unique integers, generate all possible subsets. Print total subset count.`,
    difficulty: 'MEDIUM',
    topic: 'Backtracking',
    pattern: 'State Space Tree Pruning',
    expectedTimeComplexity: 'O(2^N)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'Backtracking Subset Exploration',
    optimalConcepts: ['backtracking', 'subset generation', 'recursion tree'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        for (int i = 0; i < n; i++) sc.nextInt();
        System.out.println((long)Math.pow(2, n));
    }
}`,
    examples: [
      { input: '3\n1 2 3', output: '8', explanation: '2^3 = 8 subsets.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1\n5', expectedOutput: '2', description: '2^1 = 2 subsets' },
      { id: 'v_2', input: '2\n1 2', expectedOutput: '4', description: '2^2 = 4 subsets' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '4\n1 2 3 4', expectedOutput: '16', description: '2^4 = 16 subsets' },
      { id: 'h_2', input: '5\n1 2 3 4 5', expectedOutput: '32', description: '2^5 = 32 subsets' },
    ],
    edgeTests: [
      { id: 'e_1', input: '0', expectedOutput: '1', description: 'Empty set has 1 subset' },
    ],
  });
});
