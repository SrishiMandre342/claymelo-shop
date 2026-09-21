const fs = require('fs');
const path = require('path');

async function syncOnStart() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER || 'SrishiMandre342';
  const repo = process.env.GITHUB_REPO_NAME || 'claymelo-shop';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token) {
    console.log('[Startup Sync] No GITHUB_TOKEN configured. Using existing local data/claymelo.db.');
    return;
  }

  try {
    console.log(`[Startup Sync] Checking GitHub (${owner}/${repo} @ ${branch}) for latest database...`);
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/claymelo.db?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ClayMelo-Sync/1.0',
      },
    });

    if (!res.ok) {
      console.log(`[Startup Sync] GitHub returned HTTP ${res.status}. Keeping local database.`);
      return;
    }

    const data = await res.json();
    let fileBuffer = null;

    if (data.content) {
      fileBuffer = Buffer.from(data.content, 'base64');
    } else if (data.download_url) {
      const dlRes = await fetch(data.download_url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (dlRes.ok) {
        const arr = await dlRes.arrayBuffer();
        fileBuffer = Buffer.from(arr);
      }
    }

    if (fileBuffer && fileBuffer.length > 0) {
      const dbDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      const dbPath = path.join(dbDir, 'claymelo.db');
      fs.writeFileSync(dbPath, fileBuffer);
      console.log(`[Startup Sync] Successfully restored database from GitHub (${fileBuffer.length} bytes).`);
    }
  } catch (err) {
    console.warn('[Startup Sync] Warning: Could not sync DB on startup:', err?.message || err);
  }
}

syncOnStart().catch(err => {
  console.warn('[Startup Sync] Caught startup warning:', err);
});
