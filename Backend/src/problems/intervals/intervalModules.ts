import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const intervalModules: ProblemModule[] = Array.from({ length: 3 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `INT-${num}`;
  return createProblemModule({
    id,
    title: `Calendar Meeting Interval Merging #${i + 1}`,
    story: `An executive calendar app merges overlapping meeting time intervals into consolidated blocks.`,
    problemStatement: `Given N intervals [start, end], merge all overlapping intervals and print count of non-overlapping intervals remaining.`,
    difficulty: i < 2 ? 'MEDIUM' : 'HARD',
    topic: 'Intervals',
    pattern: 'Interval Sorting & Merging',
    expectedTimeComplexity: 'O(N log N)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'Start Time Sorting Interval Merge',
    optimalConcepts: ['intervals', 'sorting', 'start end merge'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        int count = 0;
        int i = 0;
        while (i < n) {
            int end = intervals[i][1];
            while (i + 1 < n && intervals[i + 1][0] <= end) {
                end = Math.max(end, intervals[i + 1][1]);
                i++;
            }
            count++;
            i++;
        }
        System.out.println(count);
    }
}`,
    examples: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', output: '3', explanation: '[1,3] and [2,6] merge into [1,6]. Total 3 intervals.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '2\n1 4\n4 5', expectedOutput: '1', description: 'Touching intervals merge' },
      { id: 'v_2', input: '3\n1 2\n3 4\n5 6', expectedOutput: '3', description: 'Disjoint intervals' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '3\n1 10\n2 3\n4 5', expectedOutput: '1', description: 'Fully contained intervals' },
      { id: 'h_2', input: '4\n1 5\n2 6\n7 8\n8 10', expectedOutput: '2', description: 'Two merged interval blocks' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1\n1 5', expectedOutput: '1', description: 'Single interval' },
    ],
  });
});
