/**
 * Generates random audio waveform data for visualization
 * @param numPoints - Number of data points to generate
 * @param minHeight - Minimum height (0-1)
 * @param maxHeight - Maximum height (0-1)
 * @returns Array of heights between 0-1
 */
export const generateWaveformData = (
  numPoints: number = 40,
  minHeight: number = 0.1,
  maxHeight: number = 1
): number[] => {
  const waveformData: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    // Generate smoother waveforms by using sin function with random variation
    const position = i / numPoints;
    const sinComponent = Math.sin(position * Math.PI * 2 * 3) * 0.5 + 0.5; // Oscillating base
    const randomComponent = Math.random() * 0.3; // Random variation

    // Combine components and clamp to range
    let value = sinComponent * 0.7 + randomComponent;
    value = minHeight + value * (maxHeight - minHeight);

    waveformData.push(value);
  }

  return waveformData;
};

/**
 * Generates random waveform data for an active recording
 * @param isRecording - Whether recording is active
 * @param numPoints - Number of data points
 * @returns Array of heights between 0-1
 */
export const generateLiveWaveformData = (
  isRecording: boolean,
  numPoints: number = 40
): number[] => {
  if (!isRecording) {
    return Array(numPoints).fill(0.05);
  }

  return Array(numPoints)
    .fill(0)
    .map(() => {
      return isRecording
        ? 0.2 + Math.random() * 0.8 // Higher values when recording
        : 0.05; // Minimal activity when not recording
    });
};

/**
 * Formats time in seconds to mm:ss format
 * @param seconds - Time in seconds
 * @returns Formatted time string (mm:ss)
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};
