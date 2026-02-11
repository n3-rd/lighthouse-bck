import { existsSync } from "fs";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

export type AuditResult = {
    performance: number;
    seo: number;
    bestPractices: number;
    accessibility: number;
    raw: any;
};

const CHROME_PATHS = [
    process.env.CHROME_PATH,
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
].filter(Boolean) as string[];

function getChromePath(): string | undefined {
    return CHROME_PATHS.find((p) => existsSync(p));
}

export async function runLighthouseAudit(url: string): Promise<AuditResult> {
    const chromePath = getChromePath();
    const chrome = await chromeLauncher.launch({
        chromeFlags: [
            "--headless",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
        ...(chromePath && { chromePath }),
    });
    const options = { logLevel: "info", output: "json", port: chrome.port };

    // @ts-ignore - lighthouse types can be tricky with commonjs/esm interop
    const runnerResult = await lighthouse(url, options);
    if (!runnerResult) throw new Error("Lighthouse failed to run");

    const reportJson = JSON.parse(runnerResult.report as string);

    await chrome.kill();

    return {
        performance: Math.round((reportJson.categories.performance?.score || 0) * 100),
        seo: Math.round((reportJson.categories.seo?.score || 0) * 100),
        bestPractices: Math.round((reportJson.categories["best-practices"]?.score || 0) * 100),
        accessibility: Math.round((reportJson.categories.accessibility?.score || 0) * 100),
        raw: reportJson,
    };
}
