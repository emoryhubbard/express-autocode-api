import * as admin from 'firebase-admin';
import { extractJS } from "../library/extractjs";
import { prompt, addInstruct } from "../library/prompt"
import { logAndRun } from "../library/run"
import dotenv from "dotenv";
dotenv.config();

export const removeFeature = async (req: any, res: any) => {
    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is currently intended to run only locally for your own Autocode instance. See main Autocode README (not this repo README) for up-to-date usage instructions.'});
        return;
    }
    const { 'doc-id': docId } = req.query;

    console.log('docId in endpoint: ', docId);

    if (!docId) {
        res.status(400).send('Missing docId parameter');
        return;
    }

    const firestore = admin.firestore();

    try {
        const featureDoc = await firestore.collection('features').doc(docId).get();

        if (!featureDoc.exists) {
        res.status(404).send('Feature document not found');
        return;
        }

        const featureData = featureDoc.data();

        // Modify feature data
        const modifiedFeatureData = {
        ...featureData,
        status: "Complete" // Modify the status as needed
        // Add other modifications here if needed
        };

        // Update feature document in Firestore
        await firestore.collection('features').doc(docId).update(modifiedFeatureData);

        // Respond with modified feature data and feature ID
        res.status(200).json({ ...modifiedFeatureData, docId });
    } catch (error) {
        console.error('Error updating feature:', error);
        res.status(500).send('Error updating feature');
    }

    /*const firestore = admin.firestore();
    
    try {
        const response = await firestore.collection('features').doc(docId).delete();
        console.log("Firestore response to removal request: ");
        console.log(response);
        res.status(200).send('Feature removed successfully');
    } catch (error) {
        console.error('Error removing feature:', error);
        res.status(500).send('Error removing feature');
    }*/
}
