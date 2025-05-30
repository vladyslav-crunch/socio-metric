import { Request, Response } from 'express';
import { CrimeRecord } from '../Entities/CrimeRecord';
import { UnemploymentRecord } from '../Entities/UnemploymentRecord';
import { CrimeUnemploymentRecord } from '../Entities/CrimeUnemploymentRecord';
import { AppDataSource } from '../data-source';

interface MergeRequestPayload {
    crime: {
        format: 'xml' | 'json';
        records: any[];
    };
    unemployment: {
        format: 'xml' | 'json';
        records: any[];
    };
}

interface ParsedCrime {
    country_name: string;
    country_code: string;
    year: number;
    crime_rate: number;
}

interface ParsedUnemployment {
    country_name: string;
    country_code: string;
    year: number;
    unemployment_rate: number;
}

interface MergedEntry {
    country_name: string;
    country_code: string;
    year: number;
    crime_rate: number;
    unemployment_rate: number | null;
}

export const handleMergeData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crime, unemployment } = req.body as MergeRequestPayload;
        const user = (req as any).user;

        const errors: string[] = [];

        if (!crime) errors.push('Missing "crime" section');
        if (!unemployment) errors.push('Missing "unemployment" section');

        if (crime && !['xml', 'json'].includes(crime.format)) {
            errors.push('Invalid crime format. Must be "xml" or "json".');
        }

        if (unemployment && !['xml', 'json'].includes(unemployment.format)) {
            errors.push('Invalid unemployment format. Must be "xml" or "json".');
        }

        if (crime && (!Array.isArray(crime.records) || crime.records.some(r => typeof r.crime_rate === 'undefined'))) {
            errors.push('"crime.records" must be an array of objects with "crime_rate" field.');
        }

        if (unemployment && (!Array.isArray(unemployment.records) || unemployment.records.some(r => typeof r.unemployment_rate === 'undefined'))) {
            errors.push('"unemployment.records" must be an array of objects with "unemployment_rate" field.');
        }

        if (errors.length > 0) {
            res.status(400).json({ error: errors });
            return;
        }

        const crimeRecords = crime.records.map((record: any) => ({
            country_name: record.country_name,
            country_code: record.country_code,
            year: parseInt(record.year),
            crime_rate: parseFloat(record.crime_rate),
            user: user
        }));

        const unemploymentRecords = unemployment.records.map((record: any) => {
            if (
                record.unemployment_rate === null ||
                typeof record.unemployment_rate === 'undefined'
            ) {
                throw new Error(`Unemployment record for ${record.country_name}, ${record.year} is missing unemployment_rate`);
            }

            return {
                country_name: record.country_name,
                country_code: record.country_code,
                year: parseInt(record.year),
                unemployment_rate: parseFloat(record.unemployment_rate),
                user: user
            };
        });

        // Clear existing records for the user before saving new data
        await AppDataSource.getRepository(CrimeUnemploymentRecord).delete({ user: user });
        await AppDataSource.getRepository(UnemploymentRecord).delete({ user: user });
        await AppDataSource.getRepository(CrimeRecord).delete({ user: user });

        // Save crime records
        const crimeRepo = AppDataSource.getRepository(CrimeRecord);
        const savedCrime = await crimeRepo.save(crimeRecords);

        // Save unemployment records
        const unemploymentRepo = AppDataSource.getRepository(UnemploymentRecord);
        const savedUnemployment = await unemploymentRepo.save(unemploymentRecords);

        // Create merged data
        const mergedData = crimeRecords.map((crime: ParsedCrime) => {
            const match = unemploymentRecords.find((u: ParsedUnemployment) => u.country_code === crime.country_code && u.year === crime.year);
            if (!match) {
                console.log('Crime:', crime.country_code, crime.year);
                console.log('Unemployment candidates:', unemploymentRecords.map((u: ParsedUnemployment) => `${u.country_code}-${u.year}`));
            }
            const merged = {
                country_name: crime.country_name,
                country_code: crime.country_code,
                year: crime.year,
                crime_rate: crime.crime_rate,
                unemployment_rate: match?.unemployment_rate ?? null
            };

            return merged;
        });
        const invalidMerged = mergedData.filter(entry =>
            entry.unemployment_rate === null || typeof entry.unemployment_rate === 'undefined'
        );

        if (invalidMerged.length > 0) {
            res.status(400).json({
                error: 'Unemployment data is invalid or incomplete. Missing unemployment_rate for some records.',
                details: invalidMerged.map(e => ({
                    country: e.country_name,
                    year: e.year
                }))
            });
            return;
        }

        // Save merged records
        const mergedRepo = AppDataSource.getRepository(CrimeUnemploymentRecord);

        const mergedRecordsToSave = mergedData
            .filter(entry => entry.unemployment_rate !== undefined)
            .map((data: MergedEntry) => ({
                country: data.country_name,
                country_code: data.country_code,
                year: data.year,
                crime_rate: data.crime_rate,
                unemployment_rate: data.unemployment_rate ?? undefined,
                user: user
            }));

        if (mergedRecordsToSave.length === 0) {
            console.warn('No merged records matched for saving.');
        }

        await mergedRepo.save(mergedRecordsToSave);

        // Transform to chartDataByYear
        const chartDataByYear: Record<number, { country: string; unemployment: number | null; crime: number }[]> = {};

        for (const entry of mergedData) {
            if (!chartDataByYear[entry.year]) {
                chartDataByYear[entry.year] = [];
            }
            chartDataByYear[entry.year].push({
                country: entry.country_name,
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