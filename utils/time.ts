// utils/time.ts
export function calculateTimeLeft(registrationTime: string): string {
  const start = new Date(registrationTime);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
