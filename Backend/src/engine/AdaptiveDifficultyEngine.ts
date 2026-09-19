import { UserSkillProfile, DSATopic, Difficulty, QuestionData } from '../types/index.js';

export class AdaptiveDifficultyEngine {
  public static updateProfile(
    profile: UserSkillProfile,
    topic: DSATopic,
    score: number, // Out of 10
    passedAll: boolean,
    hintsUsed: number
  ): UserSkillProfile {
    const updated = { ...profile };

    // Update topic score (moving average)
    const currentScore = updated.topicStrength[topic] ?? 50;
    const performanceWeight = (score / 10) * 100;
    const hintPenalty = hintsUsed * 5;
    const adjustedPerformance = Math.max(0, performanceWeight - hintPenalty);

    // Exponential moving average update (α = 0.25)
    const newTopicScore = Math.round(currentScore * 0.75 + adjustedPerformance * 0.25);
    updated.topicStrength[topic] = Math.min(100, Math.max(0, newTopicScore));

    updated.totalAttempts += 1;
    if (passedAll) updated.totalSolved += 1;
    updated.successRate = Math.round((updated.totalSolved / updated.totalAttempts) * 100);

    // Update overall average score
    updated.averageScore = Math.round((updated.averageScore * (updated.totalAttempts - 1) + score) / updated.totalAttempts * 10) / 10;
    updated.hintUsageCount += hintsUsed;

    return updated;
  }

  public static selectNextQuestion(
    questions: QuestionData[],
    userProfile: UserSkillProfile,
    attemptedIds: string[],
    preferredTopic?: DSATopic
  ): QuestionData {
    const unattempted = questions.filter((q) => !attemptedIds.includes(q.id));
    const pool = unattempted.length > 0 ? unattempted : questions;

    let targetTopic = preferredTopic;
    if (!targetTopic) {
      // Find weakest topic in skill profile
      let lowestScore = 101;
      for (const [t, s] of Object.entries(userProfile.topicStrength)) {
        if (s < lowestScore) {
          lowestScore = s;
          targetTopic = t as DSATopic;
        }
      }
    }

    const topicPool = pool.filter((q) => q.topic === targetTopic);
    const candidatePool = topicPool.length > 0 ? topicPool : pool;

    // Determine target difficulty based on user average score
    let targetDifficulty: Difficulty = 'EASY';
    const userScore = userProfile.topicStrength[targetTopic || 'Arrays'] || 50;
    if (userScore >= 80) targetDifficulty = 'HARD';
    else if (userScore >= 60) targetDifficulty = 'MEDIUM';
    else if (userScore < 40) targetDifficulty = 'BEGINNER';

    const matchDiff = candidatePool.filter((q) => q.difficulty === targetDifficulty);
    if (matchDiff.length > 0) {
      return matchDiff[Math.floor(Math.random() * matchDiff.length)];
    }

    return candidatePool[Math.floor(Math.random() * candidatePool.length)];
  }
}
