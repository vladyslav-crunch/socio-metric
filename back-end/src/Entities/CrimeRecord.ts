import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { User } from './User';

@Entity()
export class CrimeRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    year!: number;

    @Column()
    country_name!: string;

    @Column()
    country_code!: string;

    @Column('float')
    crime_rate!: number;

    @ManyToOne(() => User)
    user!: User;
}
