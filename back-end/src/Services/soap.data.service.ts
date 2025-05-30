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
        const records = await repo
            .createQueryBuilder("record")
            .select([
                "record.country AS country",
                "record.country_code AS country_code",
                "record.year AS year",
                "record.crime_rate AS crime_rate",
                "record.unemployment_rate AS unemployment_rate"
            ])
            .where("record.userId = :userId", { userId: decoded.id })
            .getRawMany();
        return records;
    }
};