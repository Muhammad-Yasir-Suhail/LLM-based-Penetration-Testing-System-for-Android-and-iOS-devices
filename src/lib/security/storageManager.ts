import fs from 'node:fs';
import path from 'node:path';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'storage', 'uploads');

/**
 * Default retention window: 24 hours.
 * Configurable via VULNCOPE_APK_RETENTION_HOURS environment variable.
 */
export function getRetentionPeriodMs(): number {
  const hours = parseFloat(process.env.VULNCOPE_APK_RETENTION_HOURS || '24');
  return Math.max(1, isNaN(hours) ? 24 : hours) * 60 * 60 * 1000;
}

/**
 * Throttle interval between automatic cleanup passes: 10 minutes.
 */
const MIN_CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
const MAX_CLEANUP_FILES_PER_CYCLE = 25;

let lastCleanupTimestamp = 0;

// Set of storage keys currently locked by active analysis runs
const activeLocks = new Set<string>();

/**
 * Strict format allowlist for upload storage keys.
 * Format: <16-char hex prefix>_<sanitized filename>.apk
 */
const STORAGE_KEY_REGEX = /^[a-f0-9]{16}_[a-zA-Z0-9._-]{1,120}$/;

export function isValidStorageKey(storageKey: string): boolean {
  if (typeof storageKey !== 'string') return false;
  return STORAGE_KEY_REGEX.test(storageKey.trim());
}

/**
 * Resolves an uploaded file path safely with filesystem containment verification.
 */
export function resolveUploadPath(storageKey: string): string {
  if (!isValidStorageKey(storageKey)) {
    throw new Error('Invalid storage key format');
  }

  const cleanKey = storageKey.trim();
  const targetPath = path.resolve(UPLOAD_DIR, cleanKey);

  // Containment verification
  const relative = path.relative(UPLOAD_DIR, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative) || path.dirname(targetPath) !== UPLOAD_DIR) {
    throw new Error('Path traversal attempt rejected in storage key');
  }

  return targetPath;
}

export function lockStorageKey(storageKey: string): void {
  if (isValidStorageKey(storageKey)) {
    activeLocks.add(storageKey);
  }
}

export function unlockStorageKey(storageKey: string): void {
  activeLocks.delete(storageKey);
}

export function isStorageKeyLocked(storageKey: string): boolean {
  return activeLocks.has(storageKey);
}

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export interface PruneResult {
  prunedCount: number;
  preservedCount: number;
  lockedCount: number;
}

/**
 * Prunes expired or orphaned APK files from storage/uploads/.
 * Enforces active file protection, age threshold, and bounded cycle limits.
 */
export function pruneExpiredUploads(options?: {
  maxAgeMs?: number;
  maxFiles?: number;
}): PruneResult {
  const maxAgeMs = options?.maxAgeMs ?? getRetentionPeriodMs();
  const maxFiles = options?.maxFiles ?? MAX_CLEANUP_FILES_PER_CYCLE;
  const now = Date.now();

  let prunedCount = 0;
  let preservedCount = 0;
  let lockedCount = 0;

  try {
    ensureUploadDir();
    const files = fs.readdirSync(UPLOAD_DIR);

    for (const file of files) {
      if (prunedCount >= maxFiles) {
        break; // Bounded cleanup ceiling reached
      }

      // Check if file is actively locked
      if (activeLocks.has(file)) {
        lockedCount++;
        preservedCount++;
        continue;
      }

      try {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);

        if (!stats.isFile()) continue;

        const ageMs = now - stats.mtimeMs;
        if (ageMs > maxAgeMs) {
          fs.unlinkSync(filePath);
          prunedCount++;
        } else {
          preservedCount++;
        }
      } catch (err) {
        console.warn(`[VulnCope StorageManager] Could not evaluate file ${file}:`, err);
      }
    }
  } catch (err) {
    console.warn(`[VulnCope StorageManager] Error during upload cleanup:`, err);
  }

  return { prunedCount, preservedCount, lockedCount };
}

/**
 * Throttled maintenance hook to run cleanup without stalling HTTP request handlers.
 */
export function triggerMaintenanceIfNeeded(): void {
  const now = Date.now();
  if (now - lastCleanupTimestamp >= MIN_CLEANUP_INTERVAL_MS) {
    lastCleanupTimestamp = now;
    // Execute asynchronously without blocking
    setImmediate(() => {
      try {
        pruneExpiredUploads();
      } catch {
        // Suppress background maintenance errors
      }
    });
  }
}
