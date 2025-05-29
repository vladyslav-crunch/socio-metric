import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from './User';
import { ManyToOne } from 'typeorm';

@Entity()
export class UnemploymentRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    year!: number;

    @Column()
    country_name!: string;

    @Column()
    country_code!: string;

    @Column('float')
    unemployment_rate!: number;

    @ManyToOne(() => User)
    user!: User;
}
