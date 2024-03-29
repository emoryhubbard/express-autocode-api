import { Page } from "puppeteer-core";
const chrome = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export async function logAndRun(url: string): Promise<string> {
    let path = '';
    if (process.env.PROD != 'false')
        path = await chrome.executablePath();
    if (process.env.PROD == 'false')
        path = '/usr/bin/google-chrome-stable';
    
        const browser = await puppeteer.launch({
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: path,
        headless: 'new',
        ignoreHTTPSErrors: true
      });
    
    const page = await browser.newPage();

    let consoleLogOutput = '';
    try {
        consoleLogOutput = await (evaluateWithTimeout(page, url, 60000)) as string;
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

async function evaluateWithTimeout(page: Page, url: string, timeout: number): Promise<any> {
    let allLogs = '';

    // Attach event listener to capture console logs
    page.on('console', message => {
        if (!(message.text().includes("Warning: A future version of React will block javascript: URLs as a security precaution.")
        || message.text().includes("Download the React DevTools for a better development experience")
        || message.text().includes("The value \"product-width\" for key \"width\" is invalid, and has been ignored.")
        || message.text().includes("is found, but is not used because the request credentials mode does not match. Consider taking a look at crossorigin attribute.")
        || message.text().includes("was preloaded using link preload but not used within a few seconds from the window's load event.")))
            allLogs += `${message.text()}\n`;
    });
    let evaluationPromise = page.goto(url);

    await new Promise(r => setTimeout(r, 5000));

    let timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Evaluation timed out')), timeout);
    });

    try {
        // Wait for either the evaluation or the timeout
        await Promise.race([evaluationPromise, timeoutPromise]);
        return allLogs;
    } catch (error) {
        // Handle timeout error
        console.error('Evaluation timed out:', error);
        // Rethrow the error or handle it as needed
        throw error;
    }
}