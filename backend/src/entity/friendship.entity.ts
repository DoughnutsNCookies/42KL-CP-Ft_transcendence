import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity( { name: 'friendship' } )
export class Friendship {
	constructor(sender: User, receiver: User, status: string) {
		this.sender = sender;
		this.receiver = receiver;
		this.status = status;
	}

	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user)
	sender: User;
	
	@ManyToOne(() => User, user => user)
	receiver: User;

	@Column()
	status: string;
}