import { Page } from "puppeteer-core";
const chrome = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export async function logAndRun(code: string): Promise<string> {
    let path = '';
    if (process.env.PROD != 'false')
        path = await chrome.executablePath();
    if (process.env.PROD == 'false')
        path = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    
        const browser = await puppeteer.launch({
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: path,
        headless: 'new',
        ignoreHTTPSErrors: true
      });
    
    const page = await browser.newPage();
    const html = '<html><body><h1>Hello, Puppeteer!</h1></body></html>';
    const script = `
        // Capture console log output as a string
        const consoleOutput = [];
        const originalConsoleLog = console.log;
        console.log = function() {
        consoleOutput.push(Array.from(arguments).map(String).join(' '));
        originalConsoleLog.apply(console, arguments);
        };

        ${code}

        // Return the console log output
        consoleOutput.join('\\n');
    `;
    await page.setContent(html);
    let consoleLogOutput = '';
    try {
        consoleLogOutput = await (evaluateWithTimeout(page, script, 60000)) as string;
        //consoleLogOutput = await (page.evaluate(script)) as string;
        await browser.close();
    }
    catch (e: any) {
        consoleLogOutput = e.message as string;
        if (browser && browser.process() != null) {
            browser.process()!.kill('SIGKILL');
        }
    }
    return consoleLogOutput;
}

async function evaluateWithTimeout(page: Page, script: string, timeout: number): Promise<any> {
    let evaluationPromise = page.evaluate(script);
    let timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Evaluation timed out')), timeout);
    });

    try {
        // Wait for either the evaluation or the timeout
        const result = await Promise.race([evaluationPromise, timeoutPromise]);
        return result;
    } catch (error) {
        // Handle timeout error
        console.error('Evaluation timed out:', error);
        // Rethrow the error or handle it as needed
        throw error;
    }
}