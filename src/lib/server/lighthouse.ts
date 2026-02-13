import { env } from '$env/dynamic/private';
import { existsSync } from 'fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

export type AuditResult = {
  performance: number;
  seo: number;
  bestPractices: number;
  accessibility: number;
  raw: unknown;
};

const CHROME_PATHS = [
  env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
].filter(Boolean) as string[];

function getChromePath(): string | undefined {
  return CHROME_PATHS.find((p) => existsSync(p));
}

const LH_STATUS_RE = /LH:status\s+(.+)/;

function parseStatusFromChunk(chunk: string | Uint8Array): string | null {
  const s = typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk);
  const m = s.match(LH_STATUS_RE);
  return m ? m[1].trim() : null;
}

async function runLighthouseInternal(url: string, chromePort: number): Promise<AuditResult> {
  const options = { logLevel: 'info' as const, output: 'json' as const, port: chromePort };
  const runnerResult = await lighthouse(url, options);
  if (!runnerResult) throw new Error('Lighthouse failed to run');

  const reportJson = JSON.parse(runnerResult.report as string) as {
    categories?: {
      performance?: { score?: number };
      seo?: { score?: number };
      'best-practices'?: { score?: number };
      accessibility?: { score?: number };
    };
  };

  return {
    performance: Math.round((reportJson.categories?.performance?.score ?? 0) * 100),
    seo: Math.round((reportJson.categories?.seo?.score ?? 0) * 100),
    bestPractices: Math.round((reportJson.categories?.['best-practices']?.score ?? 0) * 100),
    accessibility: Math.round((reportJson.categories?.accessibility?.score ?? 0) * 100),
    raw: reportJson,
  };
}

export async function runLighthouseAudit(url: string): Promise<AuditResult> {
  const chromePath = getChromePath();
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    ...(chromePath && { chromePath }),
  });
  try {
    return await runLighthouseInternal(url, chrome.port);
  } finally {
    await chrome.kill();
  }
}

export type AuditProgressCallback = (message: string) => void;

/** Run audit and call onStatus for each LH status line (from intercepted stdout). */
export async function runLighthouseAuditWithProgress(
  url: string,
  onStatus: AuditProgressCallback
): Promise<AuditResult> {
  const chromePath = getChromePath();
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    ...(chromePath && { chromePath }),
  });

  const patchStream = (stream: NodeJS.WriteStream) => {
    const original = stream.write.bind(stream);
    return (
      chunk: string | Uint8Array,
      encodingOrCallback?: BufferEncoding | ((err?: Error) => void),
      callback?: (err?: Error) => void
    ): boolean => {
      const msg = parseStatusFromChunk(chunk);
      if (msg) onStatus(msg);
      const cb = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;
      return original(chunk, encodingOrCallback as BufferEncoding, cb as (err?: Error) => void);
    };
  };
  const restoreStdout = process.stdout.write.bind(process.stdout);
  const restoreStderr = process.stderr.write.bind(process.stderr);
  process.stdout.write = patchStream(process.stdout) as typeof process.stdout.write;
  process.stderr.write = patchStream(process.stderr) as typeof process.stderr.write;

  try {
    return await runLighthouseInternal(url, chrome.port);
  } finally {
    process.stdout.write = restoreStdout;
    process.stderr.write = restoreStderr;
    await chrome.kill();
  }
}
