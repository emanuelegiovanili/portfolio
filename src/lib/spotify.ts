/**
 * La playlist di /about, letta da Spotify al momento della build.
 *
 * ---------------------------------------------------------------------------
 * PERCHE' IN BUILD E NON NEL BROWSER
 *
 * Il sito e' statico e finisce su Cloudflare come file. Leggere la playlist dal
 * browser vorrebbe dire mettere online un token — che non si puo' fare — oppure
 * una rotta Worker che lo custodisca, e cioe' smettere di essere un sito di soli
 * file per un numero che cambia tre volte l'anno. Qui la lettura avviene una
 * volta, in GitHub Actions, e il risultato e' scritto nella pagina.
 *
 * Il prezzo e' che il dato e' fermo fra un deploy e l'altro. E' il compromesso
 * giusto: "32 songs" scritto a mano era sbagliato dal giorno dopo, letto in
 * build e' sbagliato al massimo fino al prossimo deploy.
 *
 * ---------------------------------------------------------------------------
 * PERCHE' NON FALLISCE MAI
 *
 * Senza credenziali — cioe' in locale, dove i secret non ci sono — e a ogni
 * errore di rete, si torna ai valori scritti a mano. Nessuna build si ferma per
 * una playlist: il peggio che puo' capitare e' la pagina di ieri.
 *
 * `client_credentials` e' il flusso senza utente: legge una playlist pubblica e
 * nient'altro. Non puo' sapere cosa sto ascoltando adesso, e va bene cosi' —
 * "Now playing" nel Figma e' il titolo della sezione, non il brano in corso.
 *
 * NON E' MAI STATO PROVATO CONTRO SPOTIFY DA QUI: la policy di uscita di questa
 * sessione risponde 403 al CONNECT verso `accounts.spotify.com`, come verso
 * Cloudflare. La prima esecuzione vera e' quella in Actions, e il log dice
 * sempre quale delle due strade ha preso.
 */

export interface PlaylistData {
  /** Il nome della playlist su Spotify. */
  name: string;
  /** Quanti brani, gia' scritto come va in pagina. */
  count: string;
  /** L'indirizzo pubblico della playlist. */
  href: string;
  /** Da dove viene il dato: lo stampa la build, e si vede nei log. */
  source: 'spotify' | 'fallback';
}

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_URL = 'https://api.spotify.com/v1/playlists';

/** Una build non puo' restare appesa a un servizio esterno. */
const TIMEOUT_MS = 8000;

async function token(id: string, secret: string): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      // Basic, non il body: e' la forma che Spotify documenta per le app server.
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`token: HTTP ${res.status}`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('token: risposta senza access_token');
  return data.access_token;
}

export async function playlist(id: string, fallback: Omit<PlaylistData, 'source'>): Promise<PlaylistData> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.info('[spotify] nessuna credenziale: la playlist resta quella scritta a mano.');
    return { ...fallback, source: 'fallback' };
  }

  try {
    const access = await token(clientId, clientSecret);
    // `fields` chiede i tre valori che servono e basta: la risposta piena di una
    // playlist da trenta brani e' mezzo megabyte di roba che non si usa.
    const url = `${API_URL}/${id}?fields=name,tracks(total),external_urls(spotify)`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${access}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`playlist: HTTP ${res.status}`);

    const data = (await res.json()) as {
      name?: string;
      tracks?: { total?: number };
      external_urls?: { spotify?: string };
    };
    const total = data.tracks?.total;
    if (!data.name || typeof total !== 'number') {
      throw new Error('playlist: risposta senza nome o senza conteggio');
    }

    const live: PlaylistData = {
      name: data.name,
      count: `${total} ${total === 1 ? 'song' : 'songs'}`,
      href: data.external_urls?.spotify ?? fallback.href,
      source: 'spotify',
    };
    console.info(`[spotify] letta: "${live.name}", ${live.count}.`);
    return live;
  } catch (e) {
    // Si avvisa e si tira dritto: un problema di rete non ferma una pubblicazione.
    console.warn(`[spotify] lettura fallita (${e instanceof Error ? e.message : e}): resto sui valori scritti a mano.`);
    return { ...fallback, source: 'fallback' };
  }
}
