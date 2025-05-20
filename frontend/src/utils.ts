export const formatDuration = (ms: number | null): string => {
  if(ms === null) return '-';
  if (ms < 1000) return `${ms.toFixed(2)} ms`;

    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)} s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(1);
    if (minutes < 60) return `${minutes} min ${remainingSeconds}s`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

export const averageArray = (arr: number[]): number | null => {
  if (arr.length === 0) return null;
  const total = arr.reduce((acc, val) => acc + val, 0);
  return total / arr.length;
}
