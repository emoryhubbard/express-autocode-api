import { extractJS } from "../library/extractjs";
import { prompt, addInstruct } from "../library/prompt"
import { logAndRun } from "../library/run"
import dotenv from "dotenv";
dotenv.config();

export const generate = async (req: any, res: any) => {
    const apiKey = req.body.apiKey;
    const userPrompt = req.body.prompt;

    const maxAttempts = 2;
    let passing = false;
    let codeAttempts = [];
    let logs = [];
    let passingResponses = [];
    let currPrompt = addInstruct(userPrompt);
    let trimmedCode= '';
    for (let i = 0; i < maxAttempts && !passing; i++) {
        let codeAttempt = await prompt(currPrompt, apiKey);
        codeAttempts.push(codeAttempt);
        trimmedCode = codeAttempt;
        console.log("Code before trim: " + trimmedCode);
        trimmedCode = extractJS(codeAttempt);
        console.log("Code after trim: " + trimmedCode);

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
export const getGenerate = async (req: any, res: any) => {
    const code = 'A POST and not GET request needs to be made here. It should have a JSON body that contains a "prompt" property (a string describing the code you want to generate) and an "apiKey" property (your ChatGPT API key)';
    res.status(200).json({ code });
}
