import { DataSource } from 'typeorm';
import { User } from './Entities/User';
import { CrimeRecord } from './Entities/CrimeRecord';
import { UnemploymentRecord } from './Entities/UnemploymentRecord';
import {CrimeUnemploymentRecord} from "./Entities/CrimeUnemploymentRecord";

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, CrimeRecord,  UnemploymentRecord, CrimeUnemploymentRecord],
    synchronize: true,
});