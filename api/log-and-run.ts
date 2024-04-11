import { logAndRun } from "../library/log-and-run";
import dotenv from "dotenv";
dotenv.config();

export const logAndRunRoute = async (req: any, res: any) => {
    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is currently intended to run only in local development to get console logs from running code from prompts for Autocode testing and development. Switch to local and configure your environment variables to have a CHATGPT_APIKEY.'});
        return;
    }
    //localhost:4000/api/log-and-run?testPath=http%3A%2F%2Flocalhost%3A3000&showHTML=false
    console.log("URL param: " + req.query.testPath);
    const testPath = req.query.testPath;
    const result = await logAndRun(testPath, req.query.showHTML);
    console.log(result);
    res.status(200).json({ logs: result });
}