"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const generate_1 = require("./api/generate");
const bodyParser = require('body-parser');
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.post("/api/generate", generate_1.generate);
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
