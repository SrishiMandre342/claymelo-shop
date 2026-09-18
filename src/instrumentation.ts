export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const appUrl =
      process.env.RENDER_EXTERNAL_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://claymelo-shop.onrender.com';

    // Only keep-alive remote production instances (e.g. Render)
    if (appUrl && (appUrl.includes('onrender.com') || !appUrl.includes('localhost'))) {
      const pingUrl = `${appUrl.replace(/\/$/, '')}/api/health`;
      // Render free tier spins down after 15 mins of inactivity. Ping every 10 mins.
      const PING_INTERVAL = 10 * 60 * 1000;

      // Initial ping after 30 seconds once server is ready
      setTimeout(async () => {
        try {
          await fetch(pingUrl, {
            headers: { 'User-Agent': 'ClayMelo-KeepAlive/1.0' },
          });
        } catch {
          // Ignore startup errors
        }
      }, 30 * 1000);

      // Recurring keep-alive ping loop
      setInterval(async () => {
        try {
          await fetch(pingUrl, {
            headers: { 'User-Agent': 'ClayMelo-KeepAlive/1.0' },
          });
          console.log(`[KeepAlive] Ping sent to ${pingUrl} at ${new Date().toISOString()}`);
        } catch (err) {
          console.error('[KeepAlive] Ping failed:', err);
        }
      }, PING_INTERVAL);
    }
  }
}
