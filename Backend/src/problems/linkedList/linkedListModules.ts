import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const linkedListModules: ProblemModule[] = Array.from({ length: 6 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `LL-${num}`;
  return createProblemModule({
    id,
    title: `Linked Chain Reversal #${i + 1}`,
    story: `A distributed transaction log links records sequentially in a singly-linked list structure. Reverse the linked chain.`,
    problemStatement: `Given a singly-linked list of N nodes, reverse the list and print space-separated node values.`,
    difficulty: i < 3 ? 'EASY' : 'MEDIUM',
    topic: 'Linked List',
    pattern: 'Iterative Pointer Reversal',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Three Pointer Iterative Reversal',
    optimalConcepts: ['linked list', 'prev curr next pointers', 'in-place reversal'],
    javaCode: `import java.util.*;
import java.io.*;

class ListNode {
    long val;
    ListNode next;
    ListNode(long v) { this.val = v; }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        if (n == 0) return;
        
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        for (int i = 0; i < n; i++) {
            tail.next = new ListNode(sc.nextLong());
            tail = tail.next;
        }
        
        ListNode prev = null;
        ListNode curr = dummy.next;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        
        StringBuilder sb = new StringBuilder();
        while (prev != null) {
            sb.append(prev.val).append(prev.next == null ? "" : " ");
            prev = prev.next;
        }
        System.out.println(sb.toString());
    }
}`,
    examples: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', explanation: 'List reversed.' },
      { input: '2\n1 2', output: '2 1', explanation: 'Two element list reversed.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '1\n10', expectedOutput: '10', description: 'Single element list' },
      { id: 'v_2', input: '3\n10 20 30', expectedOutput: '30 20 10', description: 'Three element list' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '4\n-1 -2 -3 -4', expectedOutput: '-4 -3 -2 -1', description: 'Negative values' },
      { id: 'h_2', input: '6\n1 2 3 4 5 6', expectedOutput: '6 5 4 3 2 1', description: 'Even length list' },
    ],
    edgeTests: [
      { id: 'e_1', input: '1\n0', expectedOutput: '0', description: 'Zero single node' },
    ],
  });
});
