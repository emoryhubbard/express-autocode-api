import { Page } from "puppeteer-core";
import fs from 'fs';
import csvParser from 'csv-parser';
import dotenv from "dotenv";
dotenv.config();

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

    let retries = 3; // Retry up to 3 times
    while (retries > 0) {
        try {
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
        } catch (error) {
            console.error('Error fetching data:', error);
            retries--;
        }
    }
    throw new Error('Failed to fetch data after multiple retries');
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

export const makeTrainingData = async (req: any, res: any) => {
    const jsonData = fs.readFileSync('promptData.json', 'utf-8');
    const promptData = JSON.parse(jsonData);

    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is intended to run only in local development to produce training data for Autocode development. Switch to local and configure your environment variables to have a CHATGPT_APIKEY.'});
        return;
    }
    const fileName = 'trainingData.csv';
    const apiKey = process.env.CHATGPT_APIKEY as string;

    fs.writeFile(fileName, 'is_code,line\n', (err) => {});
    
    const prompts = promptData.functions;
    for (let i=0; i<401 && i<prompts.length; i++) { 
        const currPrompt = addInstruct(prompts[i]);
        try {
            const codeAttempt = await prompt(currPrompt, apiKey);
            const formatted = escapeDoubleQuotes((removeBlankLines(codeAttempt)));
            
            const lines = formatted.split(/\n/g);
            for (let j=0; j<lines.length; j++)
                await new Promise<void>((resolve) => {
                    fs.appendFile(fileName, ',"' + lines[j] + '"\n', (e) => {resolve();});
                });
            //fs.appendFile(fileName, ',"' + lines[j] + '"\n', (e)=>{});
            if ((i % 10) == 0)
                console.log("Total API calls: " + i);
        }
        catch (e) {
            console.log(e);
        }
    }
  
    res.status(200).json({ message: 'No errors when making training data' });
}
function escapeDoubleQuotes(input: string): string {
    return input.replace(/"/g, '""');
  }
function removeBlankLines(input: string): string {
    // Split the input string into lines
    const lines = input.split(/\n/g);
  
    // Filter out the lines with only whitespace characters and join them back into a single string
    return lines.filter(line => !/^\s*$/.test(line)).join('\n');
  }
export const makeTextDirectories = async (req: any, res: any) => {
    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is intended to run only in local development to produce training data for Autocode development. Switch to local and use the api/make-training-data endpoint first, properly label it, then use this endpoint to produce text directories suitable for TensorFlow.'});
        return;
    }

    const csvFile = 'trainingData.csv';
    const posDir = '../pos';
    const negDir = '../neg';

    let posLinesCount = 0;
    let negLinesCount = 0;
    let posFilesCount = 0;
    let negFilesCount = 0;

    fs.mkdirSync(posDir, { recursive: true });
    fs.mkdirSync(negDir, { recursive: true });

    fs.createReadStream(csvFile)
        .pipe(csvParser())
        .on('data', (row: CsvData) => {
            if (row.is_code === '1') {
                posLinesCount++;
            } else {
                negLinesCount++;
            }
        })
        .on('end', () => {
            const minCount = Math.min(posLinesCount, negLinesCount);
            console.log(`Total lines: ${posLinesCount} positive, ${negLinesCount} negative`);
            
            fs.createReadStream(csvFile)
                .pipe(csvParser())
                .on('data', (row: CsvData) => {
                    if ((row.is_code === '1' && posFilesCount < minCount) || (row.is_code === '0' && negFilesCount < minCount)) {
                        const filePath = row.is_code === '1' ? `${posDir}/positive${++posFilesCount}.txt` : `${negDir}/negative${++negFilesCount}.txt`;
                        fs.appendFileSync(filePath, row.line + '\n');
                    }
                })
                .on('end', () => {
                    console.log(`Directory structure created and data written for ${minCount} lines of each code.`);
                });
        });

    res.status(200).json({ message: 'No errors when making text directories' });
}
interface CsvData {
    is_code: string;
    line: string;
}