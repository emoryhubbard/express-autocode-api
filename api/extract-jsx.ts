import { extractJSX } from "../library/extractjsx";
import dotenv from "dotenv";
dotenv.config();

export const extractJSXRoute = async (req: any, res: any) => {
    const inputString = req.body.inputString;
    const result = extractJSX(inputString);
    console.log(result);
    res.status(200).json({ JSX: result });
}