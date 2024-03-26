import { prompt } from '../library/prompt';
import dotenv from "dotenv";
dotenv.config();

export const getRawResponse = async (req: any, res: any) => {
    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is intended to run only in local development to get raw responses to prompts for Autocode testing and development. Switch to local and configure your environment variables to have a CHATGPT_APIKEY.'});
        return;
    }

    const apiKey = process.env.CHATGPT_APIKEY as string;
    const response = await prompt("Could you write a JSX file for a Home component with a total visitors counter, and share some thoughts about what you wrote? It is a website about music theory.", apiKey);
    console.log(response);
    res.status(200).json({ message: 'Test results logged on console.' });
}