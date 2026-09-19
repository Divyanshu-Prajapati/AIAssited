import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const stackModules: ProblemModule[] = Array.from({ length: 6 }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  const id = `STACK-${num}`;
  return createProblemModule({
    id,
    title: `Code Syntax Expression Balancer #${i + 1}`,
    story: `A code compiler parser verifies whether opening and closing brackets in source code expressions are balanced.`,
    problemStatement: `Given a string containing characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if open brackets are closed by the same type of brackets in correct LIFO order.`,
    difficulty: i < 3 ? 'EASY' : 'MEDIUM',
    topic: 'Stack',
    pattern: 'LIFO Stack Bracket Matching',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)',
    optimalApproachName: 'Stack LIFO Bracket Verification',
    optimalConcepts: ['stack', 'lifo', 'bracket matching'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) {
                System.out.println("false");
                return;
            }
        }
        System.out.println(stack.isEmpty() ? "true" : "false");
    }
}`,
    examples: [
      { input: '()[]{}', output: 'true', explanation: 'All brackets closed correctly.' },
      { input: '(]', output: 'false', explanation: 'Mismatched bracket types.' },
    ],
    visibleTests: [
      { id: 'v_1', input: '()', expectedOutput: 'true', description: 'Simple parentheses' },
      { id: 'v_2', input: '([)]', expectedOutput: 'false', description: 'Interleaved invalid order' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '{[]}', expectedOutput: 'true', description: 'Nested valid brackets' },
      { id: 'h_2', input: '(((', expectedOutput: 'false', description: 'Unclosed opening brackets' },
    ],
    edgeTests: [
      { id: 'e_1', input: '}', expectedOutput: 'false', description: 'Single closing bracket' },
    ],
  });
});
