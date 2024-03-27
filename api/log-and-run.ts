import { logAndRun } from "../library/log-and-run";
import dotenv from "dotenv";
dotenv.config();

export const logAndRunRoute = async (req: any, res: any) => {
    const inputString = req.body.inputString;
    const result = logAndRun(inputString);
    console.log(result);
    res.status(200).json({ JSX: result });
}