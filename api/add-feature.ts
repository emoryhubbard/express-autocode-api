
import * as admin from 'firebase-admin';
import { extractJS } from "../library/extractjs";
import { prompt, addInstruct } from "../library/prompt"
import { logAndRun } from "../library/run"
import dotenv from "dotenv";
dotenv.config();

export const addFeature = async (req: any, res: any) => {
      const firestore = admin.firestore();
      const response = await firestore.collection('features').add(req.body);
      res.status(200).json(response);
}