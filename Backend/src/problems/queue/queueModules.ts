import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const queueModules: ProblemModule[] = Array.from({ length: 4 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `QUEUE-${num}`;
  return createProblemModule({
    id,
    title: `Task Scheduling FIFO Queue Processing #${i + 1}`,
    story: `A server task scheduler processes jobs in First-In, First-Out (FIFO) queue order.`,
    problemStatement: `Simulate N FIFO queue operations: ENQUEUE x inserts x, DEQUEUE removes and prints the front element.`,
    difficulty: i < 2 ? 'EASY' : 'MEDIUM',
    topic: 'Queue',
    pattern: 'FIFO Queue Buffer Simulation',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'LinkedList Queue FIFO Processing',
    optimalConcepts: ['queue', 'fifo', 'enqueue dequeue'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        Queue<Long> q = new LinkedList<>();
        
        for (int i = 0; i < n; i++) {
            String op = sc.next();
            if (op.equals("ENQUEUE")) {
                q.offer(sc.nextLong());
            } else if (op.equals("DEQUEUE")) {
                if (!q.isEmpty()) {
                    System.out.println(q.poll());
                }
            }
        }
    }
}`,
    examples: [
      { input: '3\nENQUEUE 10\nENQUEUE 20\nDEQUEUE', output: '10', explanation: '10 is dequeued first.' },
      { input: '4\nENQUEUE 5\nDEQUEUE\nENQUEUE 15\nDEQUEUE', output: '5\n15', explanation: 'FIFO order preserved.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '2\nENQUEUE 1\nDEQUEUE', expectedOutput: '1', description: 'Single item queue' },
      { id: 'v_2', input: '4\nENQUEUE 100\nENQUEUE 200\nDEQUEUE\nDEQUEUE', expectedOutput: '100\n200', description: 'Two items queue' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '5\nENQUEUE 1\nENQUEUE 2\nENQUEUE 3\nDEQUEUE\nDEQUEUE', expectedOutput: '1\n2', description: 'Multiple dequeues' },
      { id: 'h_2', input: '6\nENQUEUE 7\nDEQUEUE\nENQUEUE 8\nENQUEUE 9\nDEQUEUE\nDEQUEUE', expectedOutput: '7\n8\n9', description: 'Interleaved operations' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1\nDEQUEUE', expectedOutput: '', description: 'Empty queue dequeue' },
    ],
  });
});
