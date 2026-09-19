import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const binarySearchModules: ProblemModule[] = Array.from({ length: 8 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `BS-${num}`;
  return createProblemModule({
    id,
    title: `Sorted Index Search Pipeline #${i + 1}`,
    story: `A database indexing engine searches for target keys in sorted data partitions using binary search.`,
    problemStatement: `Given a sorted array of N integers and a target key, return the 0-based index of target if found, or -1 otherwise.`,
    difficulty: i < 4 ? 'EASY' : 'MEDIUM',
    topic: 'Binary Search',
    pattern: 'Standard Binary Search',
    expectedTimeComplexity: 'O(log N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Binary Search Half-Interval Bisection',
    optimalConcepts: ['binary search', 'mid comparison', 'logarithmic search'],
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
        
        int low = 0, high = n - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                System.out.println(mid);
                return;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        System.out.println(-1);
    }
}`,
    examples: [
      { input: '6 9\n-1 0 3 5 9 12', output: '4', explanation: '9 exists at index 4.' },
      { input: '6 2\n-1 0 3 5 9 12', output: '-1', explanation: '2 does not exist in array.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1 5\n5', expectedOutput: '0', description: 'Single element match' },
      { id: 'v_2', input: '3 100\n10 20 30', expectedOutput: '-1', description: 'Target not present' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '5 -5\n-10 -5 0 5 10', expectedOutput: '1', description: 'Negative target match' },
      { id: 'h_2', input: '4 4\n1 2 3 4', expectedOutput: '3', description: 'Match at end' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1 0\n0', expectedOutput: '0', description: 'Zero element match' },
    ],
  });
});
