"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTION_BANK = exports.GENERIC_JAVA_STARTER = void 0;
exports.GENERIC_JAVA_STARTER = `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // Read input and implement your solution here
    }
}`;
exports.QUESTION_BANK = [
    // ==========================================
    // ARRAYS (15 Questions)
    // ==========================================
    {
        id: 'arr_01',
        title: 'Warehouse Shipment Net Adjustment',
        story: 'A global logistics warehouse records daily shipment adjustments as integers. Positive values represent excess stock received, while negative values represent dispatch deficits. The warehouse manager needs to find the maximum contiguous sum of adjustments over any continuous sub-period.',
        problemStatement: 'Given an array of integers representing daily stock adjustments, find the maximum contiguous subarray sum.',
        inputFormat: 'Line 1: N (number of days)\nLine 2: N space-separated integers.',
        outputFormat: 'Print a single integer representing the maximum contiguous sub-period sum.',
        constraints: '1 <= N <= 10^5\n-10^4 <= adjustments[i] <= 10^4',
        examples: [
            { input: '8\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'Subarray [4, -1, 2, 1] gives maximum sum 6.' },
            { input: '1\n1', output: '1', explanation: 'Single element array.' },
            { input: '5\n5 4 -1 7 8', output: '23', explanation: 'Entire array gives sum 23.' }
        ],
        difficulty: 'EASY',
        topic: 'Arrays',
        pattern: "Kadane's Algorithm",
        expectedTimeComplexity: 'O(N)',
        expectedSpaceComplexity: 'O(1)',
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: exports.GENERIC_JAVA_STARTER,
        visibleTests: [
            { id: 'v1', input: '8\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
            { id: 'v2', input: '1\n1', expectedOutput: '1', isHidden: false },
            { id: 'v3', input: '5\n5 4 -1 7 8', expectedOutput: '23', isHidden: false }
        ],
        hiddenTests: [
            { id: 'h1', input: '4\n-1 -2 -3 -4', expectedOutput: '-1', isHidden: true },
            { id: 'h2', input: '6\n0 0 0 0 0 0', expectedOutput: '0', isHidden: true },
            { id: 'h3', input: '5\n-10 20 -5 15 -30', expectedOutput: '30', isHidden: true }
        ],
        edgeCases: ['All negative numbers', 'Single element array', 'Zeros present'],
        tags: ['Kadane', 'Subarray', 'Dynamic Programming']
    },
    {
        id: 'arr_02',
        title: 'Container Inventory Peak Detection',
        story: 'A sea port container terminal measures container heights in a linear bay. An entry is defined as a peak if it is strictly greater than its neighbors. Help the crane operator locate any peak entry index.',
        problemStatement: 'Given an integer array nums, find a peak element index where nums[i] > nums[i-1] and nums[i] > nums[i+1]. Return any peak entry value.',
        inputFormat: 'Line 1: N (number of containers)\nLine 2: N space-separated container heights.',
        outputFormat: 'Print the value of the peak container height.',
        constraints: '1 <= N <= 10^5\n-2^31 <= nums[i] <= 2^31 - 1',
        examples: [
            { input: '4\n1 2 3 1', output: '3', explanation: '3 is a peak element.' },
            { input: '7\n1 2 1 3 5 6 4', output: '6', explanation: 'Index 5 (height 6) is a peak.' }
        ],
        difficulty: 'EASY',
        topic: 'Arrays',
        pattern: 'Binary Search / Array Scan',
        expectedTimeComplexity: 'O(log N)',
        expectedSpaceComplexity: 'O(1)',
        timeLimit: 2000,
        memoryLimit: 256,
        starterCode: exports.GENERIC_JAVA_STARTER,
        visibleTests: [
            { id: 'v1', input: '4\n1 2 3 1', expectedOutput: '3', isHidden: false },
            { id: 'v2', input: '7\n1 2 1 3 5 6 4', expectedOutput: '6', isHidden: false }
        ],
        hiddenTests: [
            { id: 'h1', input: '1\n10', expectedOutput: '10', isHidden: true },
            { id: 'h2', input: '3\n3 2 1', expectedOutput: '3', isHidden: true }
        ],
        edgeCases: ['Single element', 'Strictly increasing', 'Strictly decreasing'],
        tags: ['Binary Search', 'Peak Element']
    }
];
// Dynamically generate remaining questions across all 19 topics with generic blank starter code
const topicsList = [
    { topic: 'Arrays', count: 13, patterns: ['Prefix Sum', 'Cycle Sort', 'Two Pointer', 'Array Scan'] },
    { topic: 'Strings', count: 10, patterns: ['Character Frequency', 'Palindrome', 'Anagram', 'Substring'] },
    { topic: 'Hashing', count: 10, patterns: ['Frequency Map', 'Subarray Sum Equals K', 'Group Anagrams'] },
    { topic: 'Two Pointers', count: 8, patterns: ['Opposite Ends', 'Fast Slow Pointer', 'Partitioning'] },
    { topic: 'Sliding Window', count: 8, patterns: ['Fixed Window', 'Dynamic Window', 'Subarray Max'] },
    { topic: 'Prefix Sum', count: 8, patterns: ['Range Query', 'Cumulative Count', 'Difference Array'] },
    { topic: 'Binary Search', count: 8, patterns: ['Search Space Reduction', 'Rotated Array', 'Lower Bound'] },
    { topic: 'Sorting', count: 6, patterns: ['Custom Comparator', 'Merge Sort', 'Quick Select'] },
    { topic: 'Stack', count: 6, patterns: ['Monotonic Stack', 'Parentheses Balancing', 'Evaluate Expression'] },
    { topic: 'Queue', count: 4, patterns: ['Sliding Window Max', 'Circular Queue', 'Level Order'] },
    { topic: 'Linked List', count: 6, patterns: ['Reversal', 'Cycle Detection', 'Merge Lists'] },
    { topic: 'Trees', count: 5, patterns: ['Binary Tree Traversal', 'BST Search', 'Depth First Search'] },
    { topic: 'Graphs', count: 5, patterns: ['BFS Traversal', 'DFS Cycle Detection', 'Shortest Path'] },
    { topic: 'Greedy', count: 3, patterns: ['Interval Scheduling', 'Minimum Refuels', 'Gas Station'] },
    { topic: 'Recursion', count: 2, patterns: ['Divide and Conquer', 'Recursive Tree'] },
    { topic: 'Backtracking', count: 2, patterns: ['Subset Generation', 'N-Queens / Grid Path'] },
    { topic: 'Dynamic Programming', count: 6, patterns: ['Knapsack 0/1', 'Longest Common Subsequence', 'Coin Change'] },
    { topic: 'Intervals', count: 3, patterns: ['Merge Intervals', 'Meeting Rooms', 'Non-overlapping'] },
    { topic: 'Bit Manipulation', count: 3, patterns: ['Single Number', 'Bitwise AND/OR', 'Counting Bits'] }
];
const stories = [
    'Bank transaction log processing', 'Railway train dispatch scheduling', 'Online food delivery rider assignment',
    'Hospital emergency patient triage queue', 'E-commerce flash sale order throttling', 'Server CPU log monitoring system',
    'Social media post engagement analytics', 'Energy grid power consumption surge analyzer', 'Automated manufacturing assembly line',
    'Student exam grade ranking portal', 'Flight booking seat reservation engine', 'Smart traffic camera vehicle speed monitor',
    'Fleet management GPS coordinate tracking', 'Cryptocurrency wallet transaction validator', 'Stock exchange order book matcher'
];
let globalIdx = 3;
for (const t of topicsList) {
    for (let i = 0; i < t.count; i++) {
        const qId = `${t.topic.toLowerCase().replace(/\s+/g, '_')}_${i + 1}`;
        const storyDesc = stories[(globalIdx * 7) % stories.length];
        const pattern = t.patterns[i % t.patterns.length];
        const difficulty = i % 3 === 0 ? 'EASY' : i % 3 === 1 ? 'MEDIUM' : 'HARD';
        exports.QUESTION_BANK.push({
            id: qId,
            title: `${t.topic} Scenario: ${storyDesc} #${i + 1}`,
            story: `An automated ${storyDesc.toLowerCase()} system needs to process incoming telemetry streams to optimize performance and prevent bottlenecks.`,
            problemStatement: `Given an array of integer signals representing telemetry data, perform efficient computation using ${t.topic}.`,
            inputFormat: 'Line 1: N (number of data elements)\nLine 2: N space-separated integers.',
            outputFormat: 'Print the computed integer scalar or transformed result.',
            constraints: '1 <= N <= 50,000\n-10^4 <= elements[i] <= 10^4',
            examples: [
                { input: '5\n10 20 30 40 50', output: '150', explanation: 'Sample data processing result.' },
                { input: '3\n5 5 5', output: '15', explanation: 'Uniform values processing.' }
            ],
            difficulty,
            topic: t.topic,
            pattern,
            expectedTimeComplexity: difficulty === 'HARD' ? 'O(N log N)' : 'O(N)',
            expectedSpaceComplexity: 'O(N)',
            timeLimit: 2000,
            memoryLimit: 256,
            starterCode: exports.GENERIC_JAVA_STARTER,
            visibleTests: [
                { id: `v_${qId}_1`, input: '5\n10 20 30 40 50', expectedOutput: '150', isHidden: false },
                { id: `v_${qId}_2`, input: '3\n5 5 5', expectedOutput: '15', isHidden: false }
            ],
            hiddenTests: [
                { id: `h_${qId}_1`, input: '1\n100', expectedOutput: '100', isHidden: true },
                { id: `h_${qId}_2`, input: '4\n-10 -20 30 40', expectedOutput: '40', isHidden: true }
            ],
            edgeCases: ['Single element', 'All negative numbers', 'Large values causing potential overflow'],
            tags: [t.topic, difficulty]
        });
        globalIdx++;
    }
}
