import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Channel } from './channel.entity';

@Entity( { name: 'member' } )
export class Member {
	constructor(user: User, channel: Channel, isAdmin: boolean, isBanned: boolean, isMuted: boolean, lastRead: string) {
		this.user = user;
		this.channel = channel;
		this.isAdmin = isAdmin;
		this.isBanned = isBanned;
		this.isMuted = isMuted;
		this.lastRead = lastRead;
	}
	
	@PrimaryGeneratedColumn()
	memberId: number;
	
	@ManyToOne(() => User, user => user)
	user: User;

	@ManyToOne(() => Channel, channel => channel)
	channel: Channel

	@Column()
	isAdmin: boolean;

	@Column()
	isBanned: boolean;

	@Column()
	isMuted: boolean;

	@Column()
	lastRead: string;
}