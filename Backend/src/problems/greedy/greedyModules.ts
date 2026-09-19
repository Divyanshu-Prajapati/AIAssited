import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const greedyModules: ProblemModule[] = Array.from({ length: 3 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `GREEDY-${num}`;
  return createProblemModule({
    id,
    title: `Logistics Fuel Optimization #${i + 1}`,
    story: `A delivery vehicle optimizes gas station refuels to complete a cross-country route using greedy strategy.`,
    problemStatement: `Given N fuel station costs, determine if it is possible to reach the destination with minimum cost greedy decisions.`,
    difficulty: i < 2 ? 'EASY' : 'MEDIUM',
    topic: 'Greedy',
    pattern: 'Greedy Choice Property',
    expectedTimeComplexity: 'O(N log N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Greedy Local Choice Selection',
    optimalConcepts: ['greedy algorithm', 'local optimal choice'],
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
        System.out.println(arr[0]);
    }
}`,
    examples: [
      { input: '4\n4 2 1 3', output: '1', explanation: 'Minimum fuel cost selected.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '2\n10 5', expectedOutput: '5', description: 'Two stations' },
      { id: 'v_2', input: '3\n7 3 9', expectedOutput: '3', description: 'Three stations' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '5\n100 200 50 300 150', expectedOutput: '50', description: 'Five stations' },
      { id: 'h_2', input: '4\n12 45 8 23', expectedOutput: '8', description: 'Four stations' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1\n42', expectedOutput: '42', description: 'Single station' },
    ],
  });
});
