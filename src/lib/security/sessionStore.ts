import fs from 'node:fs';
import path from 'node:path';
import { AnalysisSession } from '@/types/agent';

const STORAGE_DIR = path.resolve(process.cwd(), process.env.VULNCOPE_STORAGE_DIR || '.vulncope', 'sessions');

// In-memory cache for fast access
const sessionCache: Map<string, AnalysisSession> = new Map();

/**
 * Strict allowlist for session identifiers.
 * Only alphanumeric characters, dashes, and underscores (1 to 64 chars).
 * Prohibits slashes, dots, null bytes, percent-encoding, and path separators.
 */
const SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export function isValidSessionId(sessionId: string): boolean {
  if (typeof sessionId !== 'string') return false;
  return SESSION_ID_REGEX.test(sessionId.trim());
}

/**
 * Resolves session file path safely, guaranteeing strict containment inside STORAGE_DIR.
 * Throws an explicit error if the ID is invalid or resolves outside the intended directory.
 */
export function resolveSessionPath(sessionId: string): string {
  if (!isValidSessionId(sessionId)) {
    throw new Error('Invalid session identifier format');
  }

  const cleanId = sessionId.trim();
  const targetPath = path.resolve(STORAGE_DIR, `${cleanId}.json`);

  // Containment verification
  const relative = path.relative(STORAGE_DIR, targetPath);
  if (relative.startsWith('..') || path.isAbsolute(relative) || path.dirname(targetPath) !== STORAGE_DIR) {
    throw new Error('Path traversal attempt rejected');
  }

  return targetPath;
}

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export async function saveSession(session: AnalysisSession): Promise<void> {
  if (!session || !isValidSessionId(session.sessionId)) {
    throw new Error('Cannot persist session: invalid session identifier');
  }

  sessionCache.set(session.sessionId, session);
  try {
    ensureStorageDir();
    const filePath = resolveSessionPath(session.sessionId);
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8');
  } catch (err: any) {
    if (err.message?.includes('traversal') || err.message?.includes('identifier')) {
      throw err;
    }
    console.warn(`[VulnCope SessionStore] Could not write session to disk:`, err);
  }
}

export async function getSession(sessionId: string): Promise<AnalysisSession | null> {
  if (!isValidSessionId(sessionId)) {
    return null;
  }

  if (sessionCache.has(sessionId)) {
    return sessionCache.get(sessionId)!;
  }

  try {
    ensureStorageDir();
    const filePath = resolveSessionPath(sessionId);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const session = JSON.parse(content) as AnalysisSession;
      sessionCache.set(sessionId, session);
      return session;
    }
  } catch (err) {
    console.warn(`[VulnCope SessionStore] Error reading session ${sessionId}:`, err);
  }

  return null;
}

export async function listSessions(): Promise<AnalysisSession[]> {
  const result: AnalysisSession[] = [];
  const seenIds = new Set<string>();

  // Disk sessions
  try {
    ensureStorageDir();
    const files = fs.readdirSync(STORAGE_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const id = file.slice(0, -5);
        if (!isValidSessionId(id)) {
          continue; // Ignore non-conforming or suspicious files
        }
        try {
          const filePath = resolveSessionPath(id);
          const content = fs.readFileSync(filePath, 'utf8');
          const session = JSON.parse(content) as AnalysisSession;
          result.push(session);
          seenIds.add(id);
          sessionCache.set(id, session);
        } catch {
          // ignore corrupted file
        }
      }
    }
  } catch (err) {
    console.warn(`[VulnCope SessionStore] Error reading session dir:`, err);
  }

  // Add any in-memory sessions not on disk
  sessionCache.forEach((session, id) => {
    if (!seenIds.has(id)) {
      result.push(session);
    }
  });

  // Sort descending by creation date
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

