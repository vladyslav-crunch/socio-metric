import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface CrimeData {
    country_name: string;
    country_code: string;
    year: number;
    crime_rate: number;
}

interface UnemploymentEntry {
    country: string;
    year: number;
    unemployment_rate: number;
}

interface MergedData {
    country_name: string;
    country_code: string;
    year: number;
    crime_rate: number;
    unemployment_rate?: number;
}

// Core merging logic
const mergeData = (crimePath: string, unemploymentPath: string): MergedData[] => {
    const crimeData: CrimeData[] = JSON.parse(fs.readFileSync(crimePath, 'utf-8'));
    const unemploymentData: Record<string, UnemploymentEntry[]> = JSON.parse(fs.readFileSync(unemploymentPath, 'utf-8'));

    return crimeData.map(crime => {
        const match = unemploymentData[crime.country_code]?.find(entry => entry.year === crime.year);
        return {
            ...crime,
            unemployment_rate: match?.unemployment_rate
        };
    });
};

// Express controller
export const handleMergeData = (req: Request, res: Response): void => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const crimeFile = files['crimeData']?.[0];
        const unemploymentFile = files['unemploymentData']?.[0];

        if (!crimeFile || !unemploymentFile) {
            res.status(400).json({ error: 'Both crimeData and unemploymentData files are required.' });
            return;
        }

        const result = mergeData(
            path.resolve(crimeFile.path),
            path.resolve(unemploymentFile.path)
        );

        // Optionally delete uploaded files
        fs.unlinkSync(crimeFile.path);
        fs.unlinkSync(unemploymentFile.path);

        res.json(result);
    } catch (error) {
        console.error('Error in merging data:', error);
        res.status(500).json({ error: 'Failed to process files' });
    }
};
