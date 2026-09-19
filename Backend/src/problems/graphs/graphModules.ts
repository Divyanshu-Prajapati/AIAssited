import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const graphModules: ProblemModule[] = Array.from({ length: 5 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `GRAPH-${num}`;
  return createProblemModule({
    id,
    title: `Network Infrastructure Reachability #${i + 1}`,
    story: `A telecom network monitors connected node clusters. Determine if path exists between source and destination.`,
    problemStatement: `Given an undirected graph with N nodes (0..N-1) and E edges, determine if a path exists between source S and destination D. Print true or false.`,
    difficulty: i < 3 ? 'EASY' : 'MEDIUM',
    topic: 'Graphs',
    pattern: 'Breadth First Search / Union Find',
    expectedTimeComplexity: 'O(V + E)',
    expectedSpaceComplexity: 'O(V)',
    optimalApproachName: 'BFS Graph Reachability Traversal',
    optimalConcepts: ['graph traversal', 'bfs', 'queue', 'visited set'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int e = sc.nextInt();
        int s = sc.nextInt();
        int d = sc.nextInt();
        
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < e; i++) {
            int u = sc.nextInt();
            int v = sc.nextInt();
            adj.get(u).add(v);
            adj.get(v).add(u);
        }
        
        boolean[] visited = new boolean[n];
        Queue<Integer> q = new LinkedList<>();
        q.offer(s);
        visited[s] = true;
        
        while (!q.isEmpty()) {
            int curr = q.poll();
            if (curr == d) {
                System.out.println("true");
                return;
            }
            for (int neighbor : adj.get(curr)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.offer(neighbor);
                }
            }
        }
        System.out.println("false");
    }
}`,
    examples: [
      { input: '3 2 0 2\n0 1\n1 2', output: 'true', explanation: 'Path 0 -> 1 -> 2 exists.' },
      { input: '6 3 0 5\n0 1\n0 2\n3 5', output: 'false', explanation: 'No path between 0 and 5.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1 0 0 0', expectedOutput: 'true', description: 'Self reachability' },
      { id: 'v_2', input: '4 2 0 3\n0 1\n2 3', expectedOutput: 'false', description: 'Disconnected components' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '4 3 0 3\n0 1\n1 2\n2 3', expectedOutput: 'true', description: 'Linear chain path' },
      { id: 'h_2', input: '5 4 0 4\n0 1\n1 2\n2 3\n3 4', expectedOutput: 'true', description: 'Long path chain' },
    ],
    edgeTests: [
      { id: 'e_1', input: '2 0 0 1', expectedOutput: 'false', description: 'Disconnected nodes' },
    ],
  });
});
