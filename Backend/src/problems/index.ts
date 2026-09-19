import { problemRegistry } from './ProblemRegistry.js';
import { arrayModules } from './arrays/arraysModules.js';
import { stringModules } from './strings/stringModules.js';
import { hashingModules } from './hashing/hashingModules.js';
import { twoPointersModules } from './twoPointers/twoPointersModules.js';
import { slidingWindowModules } from './slidingWindow/slidingWindowModules.js';
import { prefixSumModules } from './prefixSum/prefixSumModules.js';
import { binarySearchModules } from './binarySearch/binarySearchModules.js';
import { sortingModules } from './sorting/sortingModules.js';
import { stackModules } from './stack/stackModules.js';
import { queueModules } from './queue/queueModules.js';
import { linkedListModules } from './linkedList/linkedListModules.js';
import { treeModules } from './trees/treeModules.js';
import { graphModules } from './graphs/graphModules.js';
import { greedyModules } from './greedy/greedyModules.js';
import { recursionModules } from './recursion/recursionModules.js';
import { backtrackingModules } from './backtracking/backtrackingModules.js';
import { dpModules } from './dynamicProgramming/dpModules.js';
import { intervalModules } from './intervals/intervalModules.js';
import { bitModules } from './bitManipulation/bitModules.js';

export function registerAllProblems(): void {
  const allModules = [
    ...arrayModules,
    ...stringModules,
    ...hashingModules,
    ...twoPointersModules,
    ...slidingWindowModules,
    ...prefixSumModules,
    ...binarySearchModules,
    ...sortingModules,
    ...stackModules,
    ...queueModules,
    ...linkedListModules,
    ...treeModules,
    ...graphModules,
    ...greedyModules,
    ...recursionModules,
    ...backtrackingModules,
    ...dpModules,
    ...intervalModules,
    ...bitModules,
  ];

  for (const mod of allModules) {
    if (!problemRegistry.has(mod.specification.problem.id)) {
      problemRegistry.register(mod);
    }
  }
}

// Auto-register upon import
registerAllProblems();

export * from './ProblemModule.js';
export * from './ProblemRegistry.js';
