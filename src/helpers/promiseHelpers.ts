export function waitForPromise<T>(promise: Promise<T>, defaultValue: T, timeout = 5000): Promise<T> {
    const timeoutPromise = new Promise<T>((resolve) =>
      setTimeout(() => resolve(defaultValue), timeout)
    );
    return Promise.race([promise, timeoutPromise]);
}  