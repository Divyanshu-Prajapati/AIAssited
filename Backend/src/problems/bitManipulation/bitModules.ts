import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const bitModules: ProblemModule[] = Array.from({ length: 3 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `BIT-${num}`;
  return createProblemModule({
    id,
    title: `Hardware Register Bit Manipulation #${i + 1}`,
    story: `A low-level micro-controller driver performs Bitwise XOR checks on hardware registers to identify single unpaired flags.`,
    problemStatement: `Given an array of integers where every element appears twice except for one single element, find that single element using Bitwise XOR.`,
    difficulty: i < 2 ? 'EASY' : 'MEDIUM',
    topic: 'Bit Manipulation',
    pattern: 'Bitwise XOR Accumulation',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Bitwise XOR Single Number Finder',
    optimalConcepts: ['bit manipulation', 'bitwise xor', 'xor identity'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long result = 0;
        for (int i = 0; i < n; i++) {
            result ^= sc.nextLong();
        }
        System.out.println(result);
    }
}`,
    examples: [
      { input: '3\n2 2 1', output: '1', explanation: '2 XOR 2 XOR 1 = 1.' },
      { input: '5\n4 1 2 1 2', output: '4', explanation: '4 is the single unpaired element.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1\n42', expectedOutput: '42', description: 'Single element array' },
      { id: 'v_2', input: '3\n5 9 5', expectedOutput: '9', description: 'Three elements array' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '5\n0 1 0 1 99', expectedOutput: '99', description: 'Includes zeros' },
      { id: 'h_2', input: '7\n10 20 30 10 20 30 40', expectedOutput: '40', description: 'Seven elements array' },
    ],
    edgeTests: [
      { id: 'e_1', input: '3\n-5 -5 -10', expectedOutput: '-10', description: 'Negative values XOR' },
    ],
  });
});
