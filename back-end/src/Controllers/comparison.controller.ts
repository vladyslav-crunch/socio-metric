import { Request, Response } from 'express';
import { CrimeRecord } from '../Entities/CrimeRecord';
import { UnemploymentRecord } from '../Entities/UnemploymentRecord';
import { CrimeUnemploymentRecord } from '../Entities/CrimeUnemploymentRecord';
import { AppDataSource } from '../data-source';

interface ParsedCrime {
    country_name: string;
    country_code: string;
    year: number;
    crime_rate: number;
}

interface ParsedUnemployment {
    country: string;
    year: number;
    unemployment_rate: number;
}

interface MergedEntry {
    country: string;
    country_code: string;
    year: number;
    crime_rate: number;
    unemployment_rate: number | null;
}

export const handleMergeData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crime, unemployment } = req.body;
        const user = (req as any).user;

        if (!crime?.records || !unemployment?.records) {
            res.status(400).json({ error: 'Invalid payload structure.' });
            return;
        }

        const crimeRecords = crime.records.map((record: any) => ({
            country_name: record.country_name,
            country_code: record.country_code,
            year: parseInt(record.year),
            crime_rate: parseFloat(record.crime_rate),
            user: user
        }));

        const unemploymentRecords = unemployment.records.flat().map((record: any) => ({
            country: record.country,
            year: record.year,
            unemployment_rate: record.unemployment_rate,
            user: user
        }));

        // Save crime records
        const crimeRepo = AppDataSource.getRepository(CrimeRecord);
        const savedCrime = await crimeRepo.save(crimeRecords);

        // Save unemployment records
        const unemploymentRepo = AppDataSource.getRepository(UnemploymentRecord);
        const savedUnemployment = await unemploymentRepo.save(unemploymentRecords);

        // Create merged data
        const mergedData = crimeRecords.map((crime: ParsedCrime) => {
            const match = unemploymentRecords.find((u: ParsedUnemployment) => u.country === crime.country_code && u.year === crime.year);

            const merged = {
                country: crime.country_name,
                country_code: crime.country_code,
                year: crime.year,
                crime_rate: crime.crime_rate,
                unemployment_rate: match?.unemployment_rate ?? null
            };

            return merged;
        });

        // Save merged records
        const mergedRepo = AppDataSource.getRepository(CrimeUnemploymentRecord);
        await mergedRepo.save(
            mergedData.map((data: MergedEntry) => ({
                country: data.country,
                country_code: data.country_code,
                year: data.year,
                crime_rate: data.crime_rate,
                unemployment_rate: data.unemployment_rate,
                user: user
            }))
        );

        // Transform to chartDataByYear
        const chartDataByYear: Record<number, { country: string; unemployment: number | null; crime: number }[]> = {};

        for (const entry of mergedData) {
            if (!chartDataByYear[entry.year]) {
                chartDataByYear[entry.year] = [];
            }
            chartDataByYear[entry.year].push({
                country: entry.country,
                unemployment: entry.unemployment_rate,
                crime: entry.crime_rate
            });
        }

        res.json(chartDataByYear);
    } catch (error) {
        console.error('Error in merging data:', error);
        res.status(500).json({ error: 'Failed to process and merge data.' });
    }
};