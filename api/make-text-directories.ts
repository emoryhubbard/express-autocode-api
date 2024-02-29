import fs from 'fs';
import csvParser from 'csv-parser';

export const makeTextDirectories = async (req: any, res: any) => {
    if (process.env.PROD != 'false') {
        res.status(200).send({ message: 'This API route is intended to run only in local development to produce training data for Autocode development. Switch to local and use the api/make-training-data endpoint first, properly label it, then use this endpoint to produce text directories suitable for TensorFlow.'});
        return;
    }

    const csvFile = 'trainingData.csv';
    const posDir = '../pos';
    const negDir = '../neg';

    let posLinesCount = 0;
    let negLinesCount = 0;
    let posFilesCount = 0;
    let negFilesCount = 0;

    fs.mkdirSync(posDir, { recursive: true });
    fs.mkdirSync(negDir, { recursive: true });

    fs.createReadStream(csvFile)
        .pipe(csvParser())
        .on('data', (row: CsvData) => {
            if (row.is_code === '1') {
                posLinesCount++;
            } else {
                negLinesCount++;
            }
        })
        .on('end', () => {
            const minCount = Math.min(posLinesCount, negLinesCount);
            console.log(`Total lines: ${posLinesCount} positive, ${negLinesCount} negative`);
            
            fs.createReadStream(csvFile)
                .pipe(csvParser())
                .on('data', (row: CsvData) => {
                    if ((row.is_code === '1' && posFilesCount < minCount) || (row.is_code === '0' && negFilesCount < minCount)) {
                        const filePath = row.is_code === '1' ? `${posDir}/positive${++posFilesCount}.txt` : `${negDir}/negative${++negFilesCount}.txt`;
                        fs.appendFileSync(filePath, row.line + '\n');
                    }
                })
                .on('end', () => {
                    console.log(`Directory structure created and data written for ${minCount} lines of each code.`);
                });
        });

    res.status(200).json({ message: 'No errors when making text directories' });
}
interface CsvData {
    is_code: string;
    line: string;
}