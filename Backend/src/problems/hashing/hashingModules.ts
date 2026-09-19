import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const hashingModules: ProblemModule[] = Array.from({ length: 10 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `HASH-${num}`;
  return createProblemModule({
    id,
    title: `Data Cache Key Deduplication #${i + 1}`,
    story: `A high-performance caching layer verifies duplicate keys in high-throughput data streams.`,
    problemStatement: `Given an array of integer keys, find the number of unique elements using Hashing.`,
    difficulty: i < 5 ? 'EASY' : 'MEDIUM',
    topic: 'Hashing',
    pattern: 'HashSet / HashMap Lookup',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'HashSet Unique Key Counting',
    optimalConcepts: ['hashset', 'unique elements', 'constant lookup'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Set<Long> set = new HashSet<>();
        for (int i = 0; i < n; i++) {
            set.add(sc.nextLong());
        }
        System.out.println(set.size());
    }
}`,
    examples: [
      { input: '5\n1 2 2 3 3', output: '3', explanation: 'Unique elements are {1, 2, 3}' },
      { input: '4\n10 10 10 10', output: '1', explanation: 'All elements are identical.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1\n100', expectedOutput: '1', description: 'Single element' },
      { id: 'v_2', input: '3\n1 2 3', expectedOutput: '3', description: 'All distinct' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '6\n5 5 5 2 2 1', expectedOutput: '3', description: 'Repeated frequencies' },
      { id: 'h_2', input: '4\n0 0 0 0', expectedOutput: '1', description: 'All zeros' },
    ],
    edgeTests: [
      { id: 'e_1', input: '2\n-1 -1', expectedOutput: '1', description: 'Negative duplicates' },
    ],
  });
});
