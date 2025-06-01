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

export const handleMergeData = async (req: Request, res: Response): Promise<void> => {
    await AppDataSource.transaction("SERIALIZABLE", async (transactionalEntityManager) => {
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

            const unemploymentRecords = unemployment.records.map((record: any) => ({
                country_name: record.country_name,
                country_code: record.country_code,
                year: parseInt(record.year),
                unemployment_rate: parseFloat(record.unemployment_rate),
                user: user
            }));

            await transactionalEntityManager.getRepository(CrimeUnemploymentRecord).delete({ user });
            await transactionalEntityManager.getRepository(UnemploymentRecord).delete({ user });
            await transactionalEntityManager.getRepository(CrimeRecord).delete({ user });

            await transactionalEntityManager.getRepository(CrimeRecord).save(crimeRecords);
            await transactionalEntityManager.getRepository(UnemploymentRecord).save(unemploymentRecords);

            const mergedData = crimeRecords.map(crime => {
                const match = unemploymentRecords.find(u => u.country_code === crime.country_code && u.year === crime.year);
                return {
                    country_name: crime.country_name,
                    country_code: crime.country_code,
                    year: crime.year,
                    crime_rate: crime.crime_rate,
                    unemployment_rate: match?.unemployment_rate ?? null,
                    user: user
                };
            });

            const invalidMerged = mergedData.filter(e => e.unemployment_rate === null || typeof e.unemployment_rate === 'undefined');
            if (invalidMerged.length > 0) {
                res.status(400).json({
                    error: 'Unemployment data is invalid for some merged records',
                    details: invalidMerged.map(e => ({
                        country: e.country_name,
                        year: e.year
                    }))
                });
                return;
            }

            await transactionalEntityManager.getRepository(CrimeUnemploymentRecord).save(
                mergedData.map(data => ({
                    country: data.country_name,
                    country_code: data.country_code,
                    year: data.year,
                    crime_rate: data.crime_rate,
                    unemployment_rate: data.unemployment_rate ?? undefined,
                    user: data.user
                }))
            );

            const chartDataByYear: Record<number, { country: string; unemployment: number | null; crime: number }[]> = {};
            for (const entry of mergedData) {
                if (!chartDataByYear[entry.year]) chartDataByYear[entry.year] = [];
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
    })
};