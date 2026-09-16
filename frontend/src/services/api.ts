import type { HealthStatus } from '../types/health';

export async function fetchHealthStatus(): Promise<HealthStatus> {
  const response = await fetch('/api/health');

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthStatus>;
}
