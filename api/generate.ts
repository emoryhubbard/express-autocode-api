import { Page } from "puppeteer-core";

const chrome = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')

export const generate = async (req: any, res: any) => {
    const apiKey = req.body.apiKey;
    const userPrompt = req.body.prompt;

    const maxAttempts = 2;
    let passing = false;
    let codeAttempts = [];
    let logs = [];
    let passingResponses = [];
    let currPrompt = addInstruct(userPrompt)
    let trimmedCode= '';
    for (let i = 0; i < maxAttempts && !passing; i++) {
        let codeAttempt = await prompt(currPrompt, apiKey);
        codeAttempts.push(codeAttempt);
        trimmedCode = codeAttempt;
        if (needsTrimming(codeAttempt))
            trimmedCode = trimToJS(codeAttempt);

        logs.push(await logAndRun(trimmedCode));
        passingResponses.push(await getPassingResponse(trimmedCode, logs[i], userPrompt, apiKey)); // Store passing response of each attempt
        passing = isPassing(passingResponses[i]);
        if (!passing)
            currPrompt = getNextPrompt(trimmedCode, logs[i], userPrompt, passingResponses[i]); //currPrompt = addInstruct("Could you give a corrected version of this code? The logs read: " + logs[i] + " And the code reads: " + trimmedCode);
    }
    let code = trimmedCode;
    let debugDetails = "Unable to generate properly working code. Debugging details:";
    for (let i = 0; i < codeAttempts.length; i++) {
        debugDetails += "\n\nChatGPT Response " + (i+1) + ":\n" + codeAttempts[i]
        + "\n\nConsole logs from test run " + (i+1) + ":\n" + logs[i]
        + "\n\nChatGPT evaluation of logs " + (i+1) + ": "
        + "\n\nBased on the following logs, does this code look like it ran properly?\n\n"
        + passingResponses[i];
    }
    if (!passing)
        code = debugDetails;
    //code += debugDetails; //comment this out when finished testing
    res.status(200).json({ code });
}

function addInstruct(prompt: string): string {
    return prompt + ' Furthermore, could you make sure that this is actually done in JavaScript instead, with a simple test in the code itself using console.log statments?';
    //return prompt + ' Furthermore, could you make sure that this is actually done in JavaScript instead? And could you make sure that, in your response, you give ONLY code (no text or explanation, except in CODE comments), with a simple test in the code itself using console.log statments?';
}

async function prompt(prompt: string, apiKey: string): Promise<string> {
    const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt}],
        temperature: 0.7,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestData),
        });
    
    let code = '';
    if (response.ok) {
        const responseData = await response.json();
        code = responseData.choices[0].message.content;
    } else {
        console.error('Failed to fetch data:', response.status, response.statusText);
        code = "Failed to fetch data: " + response.status + " " + response.statusText;
    }
    return code;
}

async function logAndRun(code: string): Promise<string> {
    //const browser = await puppeteer.launch();
    /*const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      });*/
    const browser = await puppeteer.launch({
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath(),
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


async function getPassingResponse(code: string, logs: string, userPrompt: string, apiKey: string): Promise<string> {
    if (!logs)
        logs = '[no console log output was produced]';
    const response = await prompt("Here is the code: " + code + "\n\nNote that it should be doing exactly what the user wanted, which was '" + userPrompt + "'. Based on the following logs, does this code look like it ran properly? Console logs:\n" + logs + "\n[end of logs]\n\nIMPORTANT: Please include the word yes, or no, in your response for clarity, and explain why.", apiKey);
    //const response = await prompt("Here is the code: " + code + "Note that it should be doing exactly what the user wanted, which was '" + userPrompt + "'. Based on the following logs, does this code look like it ran properly? IMPORTANT: Please include the word yes, or no, in your response for clarity, and explain why: " + "Console logs: " + logs, apiKey);
    //const response = await prompt("Here is the code: " + code + "Note that it should be doing exactly what the user wanted, which was '" + userPrompt + "'. Based on the following logs, does this code look like it ran properly? IMPORTANT: Please include the word yes in your response for clarity: " + "Puppeteer console output: " + logs, apiKey);
    return response;
}
function getNextPrompt(code: string, logs: string, userPrompt: string, passingResponse: string): string {
    if (!logs)
        logs = '[no console log output was produced]';
    return "There is a problem with this code:\n" + code + "\n\nNote that it should be doing exactly what the user wanted, which was '" + userPrompt + "'. Based on the following logs, the code didn't look like it ran properly: Console logs:\n" + logs + '\n\n' + 'It was explained to me that "' + passingResponse + '". Could you write a corrected version of this code?';
}
function isPassing(response: string): boolean {
    return response.toLowerCase().includes('yes');
}
function needsTrimming(inputString: string) {
    return inputString.toLowerCase().includes('```javascript');
}
function trimToJS(inputString: string): string {
    const startMarker = '```javascript';
    const endMarker = '```';

    const startIndex = inputString.indexOf(startMarker);
    const endIndex = inputString.indexOf(endMarker, startIndex + startMarker.length);
    
    let code = '';
    if (startIndex !== -1 && endIndex !== -1) {
        code = inputString.substring(startIndex + startMarker.length, endIndex).trim();
    }
    return code;
}
/*export const generate = async (req: any, res: any) => {
    const apiKey = req.body.apiKey;
    const userPrompt = req.body.prompt;

    const maxAttempts = 2;
    let passing = false;
    let codeAttempts = [];
    let logs = [];
    let passingResponses = [];
    let currPrompt = addInstruct(userPrompt)
    let trimmedCode= '';
    for (let i = 0; i < maxAttempts && !passing; i++) {
        let codeAttempt = await prompt(currPrompt, apiKey); // Store each code attempt
        codeAttempts.push(codeAttempt); // Push code attempt into the array
        trimmedCode = codeAttempt;
        if (needsTrimming(codeAttempt))
            trimmedCode = trimToJS(codeAttempt);
        console.log("Trimmed code: " + trimmedCode);
        logs.push(await logAndRun(trimmedCode));
        passingResponses.push(await getPassingResponse(trimmedCode, logs[i], userPrompt, apiKey)); // Store passing response of each attempt
        passing = isPassing(passingResponses[i]);
        if (!passing) {
            currPrompt = addInstruct("Could you give a corrected version of this code? The logs read: " + logs[i] + " And the code reads: " + trimmedCode);
        }
    }
    let code = trimmedCode;
    let debugDetails = "Unable to generate properly working code. Debugging details:";
    for (let i = 0; i < codeAttempts.length; i++) {
        debugDetails += "\n\nChatGPT Response " + (i+1) + ":\n" + codeAttempts[i]
        + "\n\nConsole logs from test run " + (i+1) + ":\n" + logs[i]
        + "\n\nChatGPT evaluation of logs " + (i+1) + ": "
        + "\n\nBased on the following logs, does this code look like it ran properly?\n\n"
        + passingResponses[i];
    }
    if (!passing)
        code = debugDetails;
    code += debugDetails; //comment this out when finished testing
    res.status(200).json({ code });
}*/