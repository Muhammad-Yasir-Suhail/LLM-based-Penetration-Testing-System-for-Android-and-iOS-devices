import fs from 'node:fs';
import path from 'node:path';
import { AnalysisSession } from '@/types/agent';

const STORAGE_DIR = path.resolve(process.cwd(), process.env.VULNCOPE_STORAGE_DIR || '.vulncope', 'sessions');

// In-memory cache for ultra-fast access
const sessionCache: Map<string, AnalysisSession> = new Map();

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export async function saveSession(session: AnalysisSession): Promise<void> {
  sessionCache.set(session.sessionId, session);
  try {
    ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, `${session.sessionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8');
  } catch (err) {
    console.warn(`[VulnCope SessionStore] Could not write session to disk:`, err);
  }
}

export async function getSession(sessionId: string): Promise<AnalysisSession | null> {
  if (sessionCache.has(sessionId)) {
    return sessionCache.get(sessionId)!;
  }

  try {
    ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, `${sessionId}.json`);
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
        const id = file.replace('.json', '');
        try {
          const filePath = path.join(STORAGE_DIR, file);
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
