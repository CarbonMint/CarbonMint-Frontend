/**
 * Resolve after a fixed number of milliseconds. Used by the mock services to
 * simulate network latency so the UI exercises real loading states.
 * If an AbortSignal is provided and aborted, the promise is rejected immediately.
 * @param {number} ms - delay in milliseconds
 * @param {AbortSignal} [signal] - optional AbortSignal for request cancellation
 * @returns {Promise<void>}
 */
export function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      return reject(err);
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      const err = new Error('Aborted');
      err.name = 'AbortError';
      reject(err);
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}

