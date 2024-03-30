import * as admin from 'firebase-admin';
import { extractJS } from "../library/extractjs";
import { prompt, addInstruct } from "../library/prompt"
import { logAndRun } from "../library/run"
import dotenv from "dotenv";
dotenv.config();

export const getFeature = async (req: any, res: any) => {
    const firestore = admin.firestore();
    
    try {
        const querySnapshot = await firestore.collection('features').limit(1).get();
        
        if (querySnapshot.empty) {
            res.status(404).send('No features found');
            return;
        }
        
        const featureDoc = querySnapshot.docs[0];
        const docId = featureDoc.id;
        const featureData = featureDoc.data();

        // Modify feature data
        const modifiedFeatureData = {
            ...featureData,
            status: "In Progress" // Modify the status as needed
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
}

/*export const getFeature = async (req: any, res: any) => {
    const firestore = admin.firestore();
    try {
        const snapshot = await firestore.collection('features').limit(1).get();
        if (snapshot.empty) {
            // If there are no documents in the collection
            res.status(404).send('No data found');
            return;
        }
        // Extracting the first document's data and its ID
        const data = snapshot.docs[0].data();
        const docId = snapshot.docs[0].id;
        // Adding docId to the data object
        const responseData = { ...data, docId };
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error getting document:', error);
        res.status(500).send('Error getting document');
    }
}*/
