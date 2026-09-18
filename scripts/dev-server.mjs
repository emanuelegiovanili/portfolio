/**
 * Avvia `astro dev` e aspetta che risponda. Usato dagli script di verifica.
 *
 * detached + unref perche' altrimenti il processo figlio tiene in vita il ciclo
 * di eventi del padre e lo script non esce mai, anche quando ha finito: il
 * risultato resta nel buffer e sembra che sia bloccato.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

export async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
      lastError = `HTTP ${res.status}`;
    } catch (e) {
      lastError = e.message;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`il server non ha risposto entro ${timeoutMs}ms: ${url} (${lastError})`);
}

/** Una porta libera davvero: riusarne una occupata da un dev server orfano fa partire i test contro il codice vecchio. */
function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

export async function startDevServer({ probePath = '/grid' } = {}) {
  const port = await freePort();
  const child = spawn('npx', ['astro', 'dev', '--port', String(port), '--host', '127.0.0.1'], {
    stdio: 'ignore',
    detached: true,
    env: { ...process.env, INCLUDE_GRID: '1' },
  });
  child.unref();

  const base = `http://127.0.0.1:${port}`;
  const stop = () => {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      // gia' morto
    }
  };

  try {
    await waitForServer(base + probePath);
  } catch (e) {
    stop();
    throw e;
  }
  return { base, port, stop };
}

/** In questo ambiente playwright non trova il proprio Chromium: c'e' solo questo. */
export const CHROMIUM = '/opt/pw-browsers/chromium';
