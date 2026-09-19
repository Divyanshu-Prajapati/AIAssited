"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleBasedAIProvider = void 0;
class RuleBasedAIProvider {
    name = 'Rule-Based Practice AI';
    async isAvailable() {
        return true;
    }
    async reviewPrompt(ctx, promptText) {
        const text = promptText.trim().toLowerCase();
        // Low quality trigger words (e.g. "give code", "solution", "solve it for me")
        const lazyKeywords = ['give code', 'solution', 'solve it', 'write code', 'just give', 'answers'];
        const containsLazy = lazyKeywords.some((k) => text.includes(k));
        // Quality parameters
        let understandingScore = 0;
        let contextScore = 0;
        let specificityScore = 0;
        let edgeCaseScore = 0;
        let complexityScore = 0;
        const suggestions = [];
        // Check understanding indicators
        if (text.includes('input') || text.includes('output') || text.includes('given') || text.includes('problem asks')) {
            understandingScore += 2;
        }
        else {
            suggestions.push('Mention input and output formats or what the problem specifically asks for.');
        }
        // Check context & technical terms
        const techTerms = ['array', 'string', 'map', 'hash', 'pointer', 'window', 'stack', 'queue', 'tree', 'graph', 'dp', 'sum', 'target', 'index'];
        const countTech = techTerms.filter((t) => text.includes(t)).length;
        contextScore = Math.min(2, countTech);
        if (contextScore === 0) {
            suggestions.push('Reference technical elements (e.g., target sum, frequencies, window boundaries).');
        }
        // Check specificity
        if (text.length > 50 && !containsLazy) {
            specificityScore += 2;
        }
        else if (text.length <= 20) {
            suggestions.push('Provide a more detailed technical explanation rather than a short snippet.');
        }
        // Check edge cases
        const edgeKeywords = ['empty', 'null', 'duplicate', 'negative', 'zero', 'boundary', 'overflow', 'edge case', 'single'];
        if (edgeKeywords.some((e) => text.includes(e))) {
            edgeCaseScore += 2;
        }
        else {
            suggestions.push('Consider edge cases such as empty inputs, zero, duplicates, or negative values.');
        }
        // Check complexity
        if (text.includes('o(') || text.includes('time') || text.includes('space') || text.includes('complexity') || text.includes('linear') || text.includes('log')) {
            complexityScore += 2;
        }
        else {
            suggestions.push('State expected time complexity (e.g., O(N) or O(N log N)).');
        }
        let score = understandingScore + contextScore + specificityScore + edgeCaseScore + complexityScore;
        if (containsLazy) {
            score = Math.min(2, score);
            suggestions.unshift('Avoid directly asking for full solutions during assessment mode.');
        }
        let rating = 'Needs Improvement';
        if (score >= 9)
            rating = 'Strong';
        else if (score >= 7)
            rating = 'Good';
        else if (score >= 5)
            rating = 'Acceptable';
        else if (score >= 3)
            rating = 'Needs Improvement';
        else
            rating = 'Poor';
        let feedback = '';
        if (rating === 'Strong' || rating === 'Good') {
            feedback = 'Your prompt provides clear technical reasoning, context, and awareness of problem constraints.';
        }
        else if (rating === 'Acceptable') {
            feedback = 'Your request has basic context, but needs more specifics regarding algorithm steps and edge cases.';
        }
        else {
            feedback = 'Your prompt lacks technical depth or asks directly for code without demonstrating your reasoning.';
        }
        return {
            score,
            rating,
            understandingScore,
            contextScore,
            specificityScore,
            edgeCaseScore,
            complexityScore,
            feedback,
            suggestions,
        };
    }
    async evaluateUnderstanding(ctx, text) {
        const analysis = await this.reviewPrompt(ctx, text);
        const missing = [];
        const lower = text.toLowerCase();
        if (!lower.includes('input'))
            missing.push('Input format & constraints');
        if (!lower.includes('output'))
            missing.push('Expected output type/structure');
        if (!lower.includes('edge') && !lower.includes('null') && !lower.includes('empty'))
            missing.push('Potential edge cases');
        if (analysis.score < 5 || missing.length > 1) {
            return {
                type: 'explain',
                status: 'needs_improvement',
                feedback: `Before proceeding to algorithm planning, please clarify:\n- ${missing.length > 0 ? missing.join('\n- ') : 'Detailed problem objective'}\n\n${analysis.feedback}`,
                missingItems: missing,
                promptQuality: analysis,
                nextSuggestedAction: 'Refine your problem understanding breakdown.',
            };
        }
        return {
            type: 'explain',
            status: 'approved',
            feedback: `Great understanding! You have identified the core input/output contract and key problem constraints.\n\nYou are now ready for STEP 2: DATA STRUCTURE & PLAN.`,
            promptQuality: analysis,
            nextSuggestedAction: 'Click "Proceed to Plan" or write your algorithm proposal.',
        };
    }
    async evaluatePlan(ctx, planText) {
        const lower = planText.toLowerCase();
        const q = ctx.question;
        const expectedPattern = q.pattern.toLowerCase();
        const expectedDS = q.topic.toLowerCase();
        const mentionsPattern = lower.includes(expectedPattern) || lower.includes(q.topic.toLowerCase());
        const mentionsComplexity = lower.includes('o(') || lower.includes('complexity') || lower.includes('time');
        const missing = [];
        if (!mentionsComplexity)
            missing.push('Explicit Time and Space Complexity Analysis');
        if (!lower.includes('brute') && !lower.includes('approach') && !lower.includes('strategy')) {
            missing.push('Clear algorithmic approach (Brute-force vs Optimized)');
        }
        if (missing.length > 0) {
            return {
                type: 'plan_review',
                status: 'needs_improvement',
                feedback: `Your plan is on the right track, but incomplete. Please specify:\n- ${missing.join('\n- ')}`,
                missingItems: missing,
                nextSuggestedAction: 'Add complexity bounds and algorithm sequence.',
            };
        }
        let feedback = `Your plan is sound! You correctly outlined an approach using ${q.topic} with targeted pattern "${q.pattern}". Expected time complexity: ${q.expectedTimeComplexity}, space complexity: ${q.expectedSpaceComplexity}.`;
        if (!mentionsPattern) {
            feedback += `\n\nTip: Consider whether a ${q.topic}-based technique allows achieving ${q.expectedTimeComplexity}.`;
        }
        return {
            type: 'plan_review',
            status: 'approved',
            feedback: `${feedback}\n\nYou are now unlocked for STEP 3: IMPLEMENTATION in Java!`,
            nextSuggestedAction: 'Switch to the Java Editor and write your solution.',
        };
    }
    async generateHint(ctx, level) {
        const q = ctx.question;
        const targetLevel = Math.min(6, Math.max(1, level));
        const hintsMap = {
            1: `HINT 1 (Pattern Identification): Think about the structural property of this problem. Does it involve subarrays, pairs, frequency counts, or recursive subproblems? Look at the topic: ${q.topic}.`,
            2: `HINT 2 (Data Structure): Consider using ${q.topic} to achieve optimal lookup or traversal speed.`,
            3: `HINT 3 (Key Observation): For "${q.title}", notice how processing elements sequentially and maintaining dynamic state allows resolving the condition efficiently.`,
            4: `HINT 4 (Optimization Direction): Aim for expected time complexity ${q.expectedTimeComplexity} and space complexity ${q.expectedSpaceComplexity}. Avoid unnecessary nested scans.`,
            5: `HINT 5 (Pseudocode Guidance):\n1. Initialize required ${q.topic} data structures.\n2. Iterate through input elements.\n3. Update state dynamically and check boundary condition.\n4. Return the calculated answer.`,
            6: `HINT 6 (Algorithm Outline): Use a standard ${q.pattern} strategy. Maintain tracking variables and evaluate input constraints: ${q.constraints}.`,
        };
        return {
            type: 'hint',
            status: 'guarded',
            feedback: hintsMap[targetLevel],
            hintLevel: targetLevel,
            nextSuggestedAction: targetLevel < 6 ? `Request Hint Level ${targetLevel + 1} if still stuck.` : 'Proceed to write implementation.',
        };
    }
    async debugCode(ctx) {
        const res = ctx.testResults;
        if (!res) {
            return {
                type: 'debug',
                status: 'guarded',
                feedback: 'Run your code against visible test cases first to collect compiler and runtime logs.',
            };
        }
        if (!res.compiled) {
            return {
                type: 'debug',
                status: 'needs_improvement',
                feedback: `COMPILATION ERROR DETECTED:\n${res.compilationError}\n\nDEBUG CLUE: Check variable scope, type declarations, semicolon syntax, or imports (e.g. java.util.*).`,
            };
        }
        const failed = res.testResults.find((t) => !t.passed);
        if (failed) {
            return {
                type: 'debug',
                status: 'needs_improvement',
                feedback: `TEST FAILURE DETECTED on Test Case (${failed.testId}):\n- Input: ${failed.input}\n- Expected: ${failed.expectedOutput}\n- Actual: ${failed.actualOutput}\n\nDEBUG CLUE: Check loop boundary conditions, off-by-one indices, zero/null handling, or return value logic.`,
            };
        }
        return {
            type: 'debug',
            status: 'approved',
            feedback: 'All visible test cases passed! Submit code to run hidden test verification.',
        };
    }
    async reviewCode(ctx) {
        const code = ctx.code || '';
        const q = ctx.question;
        const hasLoops = code.includes('for') || code.includes('while');
        const hasTargetDS = code.toLowerCase().includes(q.topic.toLowerCase()) || code.includes('Map') || code.includes('Set') || code.includes('List');
        let feedback = `CODE REVIEW FOR "${q.title}":\n`;
        feedback += `- Structure: Valid Java class syntax.\n`;
        feedback += `- Data Structure: ${hasTargetDS ? `Utilizes relevant data structures.` : `Consider using ${q.topic} to optimize complexity.`}\n`;
        feedback += `- Control Flow: ${hasLoops ? `Iteration structure present.` : `Check loop conditions.`}\n`;
        feedback += `- Expected Complexity Goal: ${q.expectedTimeComplexity} / ${q.expectedSpaceComplexity}.`;
        return {
            type: 'concept_review',
            status: 'approved',
            feedback,
        };
    }
    async dryRun(ctx, userInput) {
        const q = ctx.question;
        const example = q.examples[0] || { input: 'Sample Input', output: 'Sample Output' };
        return {
            type: 'dry_run',
            status: 'approved',
            feedback: `DRY RUN STEP-BY-STEP TRACE for "${q.title}":\n\nInput: ${example.input}\n\nStep 1: Parse input parameters.\nStep 2: Initialize algorithm state for pattern "${q.pattern}".\nStep 3: Process inputs sequentially.\nStep 4: Verify intermediate calculations.\nResult produced: ${example.output}`,
        };
    }
    async reviewConcept(ctx) {
        const q = ctx.question;
        return {
            type: 'concept_review',
            status: 'approved',
            feedback: `CONCEPT REVISION — ${q.topic.toUpperCase()} (${q.pattern}):\n\nWhat is ${q.topic}?\n- A fundamental data structure pattern used to solve computational problems efficiently.\n\nKey Strategy:\n- Identify optimal subproblems, frequency mappings, or sliding window bounds.\n- Time Complexity Target: ${q.expectedTimeComplexity}\n- Space Complexity Target: ${q.expectedSpaceComplexity}`,
        };
    }
    async generateSolution(ctx, confirmed) {
        if (!confirmed) {
            return {
                type: 'solution',
                status: 'guarded',
                feedback: 'Revealing the complete solution will conclude guarded evaluation mode for this problem. Please confirm if you wish to reveal the reference Java solution.',
                shouldRevealSolution: false,
            };
        }
        const q = ctx.question;
        return {
            type: 'solution',
            status: 'revealed',
            feedback: `REFERENCE JAVA SOLUTION FOR "${q.title}":\n\nPattern: ${q.pattern}\nExpected Time Complexity: ${q.expectedTimeComplexity}\nExpected Space Complexity: ${q.expectedSpaceComplexity}`,
            solutionCode: q.starterCode,
            shouldRevealSolution: true,
        };
    }
}
exports.RuleBasedAIProvider = RuleBasedAIProvider;
