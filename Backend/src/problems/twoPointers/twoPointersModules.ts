import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const twoPointersModules: ProblemModule[] = Array.from({ length: 8 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `TP-${num}`;
  return createProblemModule({
    id,
    title: `Container Target Pairing #${i + 1}`,
    story: `A shipping log contains sorted container weights. Find if two containers sum up to a target payload.`,
    problemStatement: `Given a sorted array of integers and a target sum, find if there exist two elements whose sum equals target. Print true or false.`,
    difficulty: i < 4 ? 'EASY' : 'MEDIUM',
    topic: 'Two Pointers',
    pattern: 'Opposite Ends Two Pointer Convergence',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Sorted Array Two Pointer Scan',
    optimalConcepts: ['left right pointers', 'sorted array', 'target comparison'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long target = sc.nextLong();
        long[] arr = new long[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextLong();
        
        int left = 0, right = n - 1;
        while (left < right) {
            long sum = arr[left] + arr[right];
            if (sum == target) {
                System.out.println("true");
                return;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        System.out.println("false");
    }
}`,
    examples: [
      { input: '4 9\n2 7 11 15', output: 'true', explanation: '2 + 7 = 9' },
      { input: '3 10\n1 2 4', output: 'false', explanation: 'No two elements sum to 10.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '2 5\n2 3', expectedOutput: 'true', description: 'Two elements matching target' },
      { id: 'v_2', input: '3 100\n10 20 30', expectedOutput: 'false', description: 'Target too large' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '5 0\n-3 -1 0 1 4', expectedOutput: 'true', description: '-1 + 1 = 0' },
      { id: 'h_2', input: '4 20\n5 5 10 15', expectedOutput: 'true', description: '5 + 15 = 20' },
    ],
    edgeTests: [
      { id: 'e_1', input: '2 0\n0 0', expectedOutput: 'true', description: 'Zero elements sum to zero' },
    ],
  });
});
