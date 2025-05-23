import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
// import { CrimeRecord } from './CrimeRecord';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;
}