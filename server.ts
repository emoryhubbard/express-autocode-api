import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { generate, getGenerate } from './api/generate';
import { makeTrainingData } from "./api/make-training-data";
import { makeTextDirectories } from "./api/make-text-directories";
import { testAcorn } from "./api/test-acorn";
const bodyParser = require('body-parser');

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post("/api/generate", generate);
app.get("/api/generate", getGenerate);
app.get("/api/make-training-data", makeTrainingData);
app.get("/api/make-text-directories", makeTextDirectories);
app.get("/api/test-acorn", testAcorn);
/*app.get("/", (req: Request, res: Response) => {
    const code = 'code will be here (get)'
    res.status(200).json({ code });
});
app.post("/", (req: Request, res: Response) => {
    const code = 'code will be here (post)'
    res.status(200).json({ code });
});*/

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});