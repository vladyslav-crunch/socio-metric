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

            const savedCrime = await transactionalEntityManager.getRepository(CrimeRecord).save(crimeRecords);
            const savedUnemployment = await transactionalEntityManager.getRepository(UnemploymentRecord).save(unemploymentRecords);
            const mergedRecordsToSave: CrimeUnemploymentRecord[] = [];

            for (const crime of savedCrime) {
                const match = savedUnemployment.find(u => u.country_code === crime.country_code && u.year === crime.year);
                if (match) {
                    const merged = new CrimeUnemploymentRecord();
                    merged.crimeRecord = crime;
                    merged.unemploymentRecord = match;
                    merged.user = user;
                    mergedRecordsToSave.push(merged);
                }
            }

            if (mergedRecordsToSave.length === 0) {
                res.status(400).json({error: 'No matches found to merge crime and unemployment data.'});
                return;
            }

            await transactionalEntityManager.getRepository(CrimeUnemploymentRecord).save(mergedRecordsToSave);

            const chartDataByYear: Record<number, { country: string; unemployment: number; crime: number }[]> = {};

            for(const record of mergedRecordsToSave) {
                const year = record.crimeRecord.year;
                if(!chartDataByYear[year]) chartDataByYear[year] = [];
                chartDataByYear[year].push({
                    country: record.crimeRecord.country_name,
                    unemployment: record.unemploymentRecord.unemployment_rate,
                    crime: record.crimeRecord.crime_rate
                });
            }
            res.json(chartDataByYear);
        } catch (error) {
            console.error('Error in merging data:', error);
            res.status(500).json({ error: 'Failed to process and merge data.' });
        }
    })
};