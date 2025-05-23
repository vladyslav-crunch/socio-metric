import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
// import { User } from './User';

@Entity()
export class CrimeRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    year!: number;

    @Column()
    type!: string;

    @Column()
    count!: number;
}
