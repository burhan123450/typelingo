/**
 * WPM = (correct characters / 5) / minutes
 */
export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctChars <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const wpm = correctChars / 5 / minutes;
  return Math.round(wpm);
}

/**
 * Accuracy = correct characters / total typed characters * 100
 */
export function calculateAccuracy(correctChars: number, totalTypedChars: number): number {
  if (totalTypedChars <= 0) return 100;
  const acc = (correctChars / totalTypedChars) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

/**
 * Consistency score = how stable the speed stayed during the test (0 to 100%).
 * Computed from per-interval WPM samples using Coefficient of Variation (CV).
 */
export function calculateConsistency(wpmSamples: number[]): number {
  if (wpmSamples.length < 2) return 100;
  const mean = wpmSamples.reduce((sum, v) => sum + v, 0) / wpmSamples.length;
  if (mean <= 0) return 0;
  const variance =
    wpmSamples.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / wpmSamples.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean; // lower is more consistent
  const score = Math.round((1 - Math.min(1, cv)) * 100);
  return Math.max(0, Math.min(100, score));
}
