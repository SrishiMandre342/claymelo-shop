import fs from 'fs';
import path from 'path';
import { getDb } from './db';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'SrishiMandre342';
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'claymelo-shop';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export function isGitHubSyncConfigured(): boolean {
  return Boolean(GITHUB_TOKEN && GITHUB_TOKEN.trim().length > 0);
}

// Simple sequential queue to avoid 409 git commit SHA race conditions
let syncQueue: Promise<any> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = syncQueue.then(task, task);
  syncQueue = result.catch(() => {});
  return result;
}

/**
 * Uploads/commits a local file to the GitHub repository using GitHub's REST API.
 * This ensures that files uploaded at runtime on Render (like photos or database changes)
 * become part of the persistent Git repository and survive any Render container restarts or spin-downs.
 */
export async function syncFileToGitHub(
  relativeFilePath: string,
  commitMessage: string
): Promise<{ success: boolean; error?: string; commitSha?: string }> {
  if (!isGitHubSyncConfigured()) {
    console.log(`[GitHub Sync] Skipped for "${relativeFilePath}" (GITHUB_TOKEN not configured).`);
    return { success: false, error: 'GITHUB_TOKEN not configured' };
  }

  return enqueue(async () => {
    try {
      const fullPath = path.resolve(process.cwd(), relativeFilePath);
      if (!fs.existsSync(fullPath)) {
        return { success: false, error: `Local file not found: ${relativeFilePath}` };
      }

      const fileBuffer = await fs.promises.readFile(fullPath);
      const base64Content = fileBuffer.toString('base64');
      const gitPath = relativeFilePath.replace(/\\/g, '/').replace(/^\//, '');

      const headers = {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ClayMelo-Sync/1.0',
      };

      // 1. Check if file already exists in repository to obtain its SHA (required for updating existing files)
      let fileSha: string | undefined;
      try {
        const getRes = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${gitPath}?ref=${GITHUB_BRANCH}`,
          { headers }
        );
        if (getRes.ok) {
          const data = await getRes.json();
          fileSha = data?.sha;
        }
      } catch (checkErr) {
        // Not found or network error, proceed as new file creation
      }

      // 2. Commit the file to GitHub repository
      const putBody: Record<string, any> = {
        message: commitMessage,
        content: base64Content,
        branch: GITHUB_BRANCH,
      };

      if (fileSha) {
        putBody.sha = fileSha;
      }

      const putRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${gitPath}`,
        {
          method: 'PUT',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(putBody),
        }
      );

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        console.error(`[GitHub Sync] Failed to commit "${gitPath}":`, errData);
        return { success: false, error: errData?.message || `HTTP ${putRes.status}` };
      }

      const putResult = await putRes.json();
      console.log(`[GitHub Sync] Successfully committed "${gitPath}" to ${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME} (${GITHUB_BRANCH}). Commit: ${putResult?.commit?.sha || 'ok'}`);

      return {
        success: true,
        commitSha: putResult?.commit?.sha,
      };
    } catch (err: any) {
      console.error(`[GitHub Sync] Exception syncing "${relativeFilePath}":`, err);
      return { success: false, error: err?.message || 'Unknown sync error' };
    }
  });
}

/**
 * Checkpoints SQLite WAL and syncs data/claymelo.db directly to GitHub repository.
 */
export async function syncDatabaseToGitHub(commitReason: string = 'Update store database'): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getDb();
    // Force write all pending WAL changes into claymelo.db before committing
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch (walErr) {
      console.warn('[GitHub Sync] WAL checkpoint warning:', walErr);
    }

    return await syncFileToGitHub('data/claymelo.db', `[ClayMelo Admin] ${commitReason}`);
  } catch (err: any) {
    console.error('[GitHub Sync] Failed to sync database:', err);
    return { success: false, error: err?.message };
  }
}
