import * as admin from 'firebase-admin';
import * as serviceAccount from '/home/emoryhubbardiv/Documents/express-autocode-api/serviceAccountKey.json';
import { extractJS } from "../library/extractjs";
import { prompt, addInstruct } from "../library/prompt"
import { logAndRun } from "../library/run"
import dotenv from "dotenv";
dotenv.config();

export const removeFeature = async (req: any, res: any) => {
    const { 'doc-id': docId } = req.query;
    console.log('docId in endpoint: ', docId);
    if (!docId) {
        res.status(400).send('Missing docId parameter');
        return;
    }

    const firestore = admin.firestore();
    
    try {
        const response = await firestore.collection('features').doc(docId).delete();
        console.log("Firestore response to removal request: ");
        console.log(response);
        res.status(200).send('Feature removed successfully');
    } catch (error) {
        console.error('Error removing feature:', error);
        res.status(500).send('Error removing feature');
    }
}
