/**
 * In-process mutex for serialising mutually exclusive operations such as
 * a database restore. Sufficient for a single-node deployment; if/when we
 * scale horizontally this should be replaced with a distributed lock.
 */
export class ProcessMutex {
  private locked = false;

  /** Try to acquire the lock. Returns true on success, false if already held. */
  tryAcquire(): boolean {
    if (this.locked) return false;
    this.locked = true;
    return true;
  }

  release(): void {
    this.locked = false;
  }

  isLocked(): boolean {
    return this.locked;
  }
}

/** Singleton mutex used to serialise restore operations. */
export const restoreMutex = new ProcessMutex();
