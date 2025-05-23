import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class UnemploymentRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    year!: number;

    @Column('decimal')
    rate!: number;
}
