import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { CrimeRecord } from './CrimeRecord';
import { UnemploymentRecord } from './UnemploymentRecord';

@Entity()
export class CrimeUnemploymentRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => CrimeRecord, { eager: true })
    crimeRecord!: CrimeRecord;

    @ManyToOne(() => UnemploymentRecord, { eager: true })
    unemploymentRecord!: UnemploymentRecord;

    @ManyToOne(() => User)
    user!: User;
}