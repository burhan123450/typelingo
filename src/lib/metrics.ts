/**
 * WPM = (correct characters / 5) / minutes
 */
export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctChars <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(correctChars / 5 / minutes);
}

/**
 * Accuracy = correct characters / total typed characters * 100
 * (every wrong key press counts as a typed character)
 */
export function calculateAccuracy(correctChars: number, totalTypedChars: number): number {
  if (totalTypedChars <= 0) return 100;
  const acc = (correctChars / totalTypedChars) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

/**
 * Consistency score (0-100%) = how stable the speed stayed during the test.
 *
 * Input: the typing speed measured separately for each second of the test.
 * We take the coefficient of variation (how much the speed jumps around
 * compared to the average) and map it to 0-100 with a smooth curve,
 * so steady typists score high and stop-start typing scores low.
 */
export function calculateConsistency(perSecondWpm: number[]): number {
  const samples = perSecondWpm.filter((v) => Number.isFinite(v));
  if (samples.length < 3) return 100;
  const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
  if (mean <= 0) return 0;
  const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / samples.length;
  const cv = Math.sqrt(variance) / mean;
  const score = 100 * (1 - Math.tanh(cv + cv ** 3 / 3 + cv ** 5 / 5));
  return Math.max(0, Math.min(100, Math.round(score)));
}
