import { AppDataSource } from '../data-source';
import { CrimeRecord } from '../Entities/CrimeRecord';
import { UnemploymentRecord } from '../Entities/UnemploymentRecord';
import { CrimeUnemploymentRecord } from '../Entities/CrimeUnemploymentRecord';
import { verifyToken } from '../utils/jwt';

export const soapDataService = {
    async getCrimeData(token: string) {
        const decoded = verifyToken(token);
        const repo = AppDataSource.getRepository(CrimeRecord);

        const records = await repo
            .createQueryBuilder("crime")
            .select([
                "crime.year AS year",
                "crime.country_name AS country_name",
                "crime.country_code AS country_code",
                "crime.crime_rate AS crime_rate"
            ])
            .where("crime.userId = :userId", { userId: decoded.id })
            .getRawMany();

        return records;
    }
    ,

    async getUnemploymentData(token: string) {
        const decoded = verifyToken(token);
        const repo = AppDataSource.getRepository(UnemploymentRecord);

        const records = await repo
            .createQueryBuilder("unemployment")
            .select([
                "unemployment.year AS year",
                "unemployment.country_name AS country_name",
                "unemployment.country_code AS country_code",
                "unemployment.unemployment_rate AS unemployment_rate"
            ])
            .where("unemployment.userId = :userId", { userId: decoded.id })
            .getRawMany();

        return records;
    },

    async getMergedData(token: string) {
        const decoded = verifyToken(token);
        const repo = AppDataSource.getRepository(CrimeUnemploymentRecord);
        const records = await repo.find({
            where: { user: { id: decoded.id } },
            relations: ['crimeRecord', 'unemploymentRecord']
        });

        return records.map(record => ({
            country: record.crimeRecord.country_name,
            country_code: record.crimeRecord.country_code,
            year: record.crimeRecord.year,
            crime_rate: record.crimeRecord.crime_rate,
            unemployment_rate: record.unemploymentRecord.unemployment_rate
        }));
    }
};