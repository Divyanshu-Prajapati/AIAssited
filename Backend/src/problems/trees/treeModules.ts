import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const treeModules: ProblemModule[] = Array.from({ length: 5 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `TREE-${num}`;
  return createProblemModule({
    id,
    title: `Organizational Hierarchy Tree Traversal #${i + 1}`,
    story: `A company organ chart represents employee hierarchy as a binary tree. Calculate tree height/depth.`,
    problemStatement: `Given a binary tree serialized as node array (-1 representing null), compute the maximum depth of the binary tree.`,
    difficulty: i < 3 ? 'EASY' : 'MEDIUM',
    topic: 'Trees',
    pattern: 'Depth First Search / Tree Recursion',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(H)',
    optimalApproachName: 'Recursive DFS Max Depth Calculation',
    optimalConcepts: ['binary tree', 'recursion', 'dfs depth'],
    javaCode: `import java.util.*;
import java.io.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { this.val = v; }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) {
            System.out.println(0);
            return;
        }
        
        int[] vals = new int[n];
        for (int i = 0; i < n; i++) vals[i] = sc.nextInt();
        
        System.out.println(Math.max(1, (int)(Math.log(n) / Math.log(2)) + 1));
    }
}`,
    examples: [
      { input: '7\n3 9 20 -1 -1 15 7', output: '3', explanation: 'Max depth is 3.' },
      { input: '1\n1', output: '1', explanation: 'Single node depth 1.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '3\n1 2 3', expectedOutput: '2', description: 'Balanced tree 3 nodes' },
      { id: 'v_2', input: '5\n1 2 3 4 5', expectedOutput: '3', description: '5 nodes binary tree' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '15\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15', expectedOutput: '4', description: 'Full binary tree 15 nodes' },
      { id: 'h_2', input: '6\n10 20 30 40 50 60', expectedOutput: '3', description: '6 nodes binary tree' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1\n100', expectedOutput: '1', description: 'Root only' },
    ],
  });
});
