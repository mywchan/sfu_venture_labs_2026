import 'server-only';
import process from 'node:process';

if (!process.versions.node || typeof window !== 'undefined') throw new Error('Server module only.');

export const DEFAULT_LOOKUP_TIMEOUT_MS = 5000;

/** Bounds the caller's wait; does not cancel the underlying SDK request.
 * Only trusted server code may supply timeoutMs. No environment/request inputs.
 */
export async function withLookupTimeout<T>(
  operation: () => Promise<T>, timeoutMs = DEFAULT_LOOKUP_TIMEOUT_MS,
): Promise<T> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new RangeError('Invalid server lookup timeout.');
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Server lookup timed out.')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
