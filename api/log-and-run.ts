import { logAndRun } from "../library/log-and-run";
import dotenv from "dotenv";
dotenv.config();

export const logAndRunRoute = async (req: any, res: any) => {
    //localhost:4000/api/log-and-run?testPath=http%3A%2F%2Flocalhost%3A3000
    console.log("URL param: " + req.query.testPath);
    const testPath = req.query.testPath;
    const result = await logAndRun(testPath);
    console.log(result);
    res.status(200).json({ logs: result });
}