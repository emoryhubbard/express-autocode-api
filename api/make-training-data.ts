import fs from 'fs';
import { prompt, addInstruct } from '../library/prompt';
import dotenv from "dotenv";
dotenv.config();

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