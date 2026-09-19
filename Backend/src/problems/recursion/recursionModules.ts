import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const recursionModules: ProblemModule[] = Array.from({ length: 2 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `REC-${num}`;
  return createProblemModule({
    id,
    title: `Recursive Fibonacci Step Sequence #${i + 1}`,
    story: `A stair-climbing robot calculates number of distinct ways to climb N steps taking 1 or 2 steps recursively.`,
    problemStatement: `Given N steps, calculate Fib(N) recursively.`,
    difficulty: 'EASY',
    topic: 'Recursion',
    pattern: 'Divide and Conquer Recursion',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'Recursive Call Stack Evaluation',
    optimalConcepts: ['recursion', 'base case', 'recursive call stack'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        System.out.println(fib(n));
    }
    
    private static long fib(int n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}`,
    examples: [
      { input: '5', output: '5', explanation: 'Fib(5) = 5.' },
      { input: '6', output: '8', explanation: 'Fib(6) = 8.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1', expectedOutput: '1', description: 'Base case 1' },
      { id: 'v_2', input: '4', expectedOutput: '3', description: 'Fib(4)' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '10', expectedOutput: '55', description: 'Fib(10)' },
      { id: 'h_2', input: '8', expectedOutput: '21', description: 'Fib(8)' },
    ],
    edgeTests: [
      { id: 'e_1', input: '0', expectedOutput: '0', description: 'Base case 0' },
    ],
  });
});
