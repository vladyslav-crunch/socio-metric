import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User} from "./User";

@Entity()
export class CrimeUnemploymentRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    country!: string;

    @Column()
    country_code!: string;

    @Column()
    year!: number;

    @Column('float')
    crime_rate!: number;

    @Column({ type: 'float', nullable: true })
    unemployment_rate!: number;

    @ManyToOne(() => User)
    user!: User;
}