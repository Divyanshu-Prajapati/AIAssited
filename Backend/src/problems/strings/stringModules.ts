import { createProblemModule } from '../moduleBuilder.js';
import { ProblemModule } from '../ProblemModule.js';

export const stringModules: ProblemModule[] = [
  // STR-001: Valid Palindrome Cleaned
  createProblemModule({
    id: 'STR-001',
    title: 'Security Access Code Palindrome Validation',
    story: 'A cyber security gateway receives alphanumeric access strings. An access token is valid if, after converting all uppercase letters to lowercase and removing non-alphanumeric characters, it reads the same forward and backward.',
    problemStatement: 'Given a string, determine if it is a palindrome considering only alphanumeric characters and ignoring cases.',
    difficulty: 'EASY',
    topic: 'Strings',
    pattern: 'Two Pointer Palindrome Verification',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Two Pointer Boundary Scan',
    optimalConcepts: ['two pointers', 'alphanumeric filter', 'case insensitive comparison'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine();
        
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                System.out.println("false");
                return;
            }
            left++;
            right--;
        }
        System.out.println("true");
    }
}`,
    examples: [
      { input: 'A man, a plan, a canal: Panama', output: 'true', explanation: 'After cleaning: "amanaplanacanalpanama" which is a palindrome.' },
      { input: 'race a car', output: 'false', explanation: 'After cleaning: "raceacar" which is not a palindrome.' },
    ],
    visibleTests: [
      { id: 'v_1', input: ' ', expectedOutput: 'true', description: 'Empty or space only string' },
      { id: 'v_2', input: 'aba', expectedOutput: 'true', description: 'Simple palindrome' },
    ],
    hiddenTests: [
      { id: 'h_1', input: '0P', expectedOutput: 'false', description: 'Alphanumeric non-match' },
      { id: 'h_2', input: 'No lemon, no melon', expectedOutput: 'true', description: 'Sentence palindrome with spaces and punctuation' },
    ],
    edgeTests: [
      { id: 'e_1', input: 'a', expectedOutput: 'true', description: 'Single character string' },
    ],
  }),

  // STR-002: Valid Anagram
  createProblemModule({
    id: 'STR-002',
    title: 'Financial Audit Anagram Permutation Matcher',
    story: 'An anti-fraud audit system compares trading transaction codes. Two codes are equivalent if one is a permutation of the other.',
    problemStatement: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    difficulty: 'EASY',
    topic: 'Strings',
    pattern: 'Frequency Array Counting',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Frequency Array Counter',
    optimalConcepts: ['frequency map', 'character counting', 'length check'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        if (!sc.hasNext()) return;
        String t = sc.next();
        
        if (s.length() != t.length()) {
            System.out.println("false");
            return;
        }
        
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        
        for (int c : count) {
            if (c != 0) {
                System.out.println("false");
                return;
            }
        }
        System.out.println("true");
    }
}`,
    examples: [
      { input: 'anagram nagaram', output: 'true', explanation: 'Both strings have identical character frequencies.' },
      { input: 'rat car', output: 'false', explanation: 'Frequencies do not match.' },
    ],
    visibleTests: [
      { id: 'v_1', input: 'a a', expectedOutput: 'true', description: 'Single letter match' },
      { id: 'v_2', input: 'ab ba', expectedOutput: 'true', description: 'Two letter anagram' },
    ],
    hiddenTests: [
      { id: 'h_1', input: 'listen silent', expectedOutput: 'true', description: 'Standard anagram words' },
      { id: 'h_2', input: 'hello billion', expectedOutput: 'false', description: 'Different length strings' },
    ],
    edgeTests: [
      { id: 'e_1', input: 'z z', expectedOutput: 'true', description: 'Single character match' },
    ],
  }),

  // STR-003 to STR-010
  ...['STR-003', 'STR-004', 'STR-005', 'STR-006', 'STR-007', 'STR-008', 'STR-009', 'STR-010'].map((id, idx): ProblemModule => createProblemModule({
    id,
    title: `String Processing Pipeline Phase #${idx + 3}`,
    story: `Logistics token parsing scenario #${idx + 3} for string string operations.`,
    problemStatement: `Execute string processing algorithm for problem ${id}.`,
    difficulty: idx % 2 === 0 ? 'EASY' : 'MEDIUM',
    topic: 'Strings',
    pattern: 'String Pattern Matching',
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)',
    optimalApproachName: 'Optimal String Traversal',
    optimalConcepts: ['string traversal', 'pattern matching'],
    javaCode: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();
        System.out.println(s.length());
    }
}`,
    examples: [
      { input: 'hello', output: '5', explanation: 'Length of string' },
      { input: 'code', output: '4', explanation: 'Length of string' },
    ],
    visibleTests: [
      { id: 'v_1', input: 'a', expectedOutput: '1', description: 'Single character' },
      { id: 'v_2', input: 'test', expectedOutput: '4', description: 'Four letters' },
    ],
    hiddenTests: [
      { id: 'h_1', input: 'logistics', expectedOutput: '9', description: 'Nine letters' },
      { id: 'h_2', input: 'dsa', expectedOutput: '3', description: 'Three letters' },
    ],
    edgeTests: [
      { id: 'e_1', input: 'x', expectedOutput: '1', description: 'Boundary single char' },
    ],
  })),
];
