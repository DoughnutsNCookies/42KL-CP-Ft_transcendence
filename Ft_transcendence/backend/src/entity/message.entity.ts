import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from './users.entity';

@Entity( { name: 'message' } )
export class Message {
	constructor(senderChannel: Channel, receiverChannel: Channel, isRoom: boolean, message: string, timeStamp: string) {
		this.senderChannel = senderChannel;
		this.receiverChannel = receiverChannel
		this.isRoom = isRoom;
		this.message = message;
		this.timeStamp = timeStamp;
	}

	@PrimaryGeneratedColumn()
	messageId: number;

	@ManyToOne(() => Channel, channel => channel)
	senderChannel: Channel;

	@ManyToOne(() => Channel, channel => channel)
	receiverChannel: Channel;

	@Column()
	isRoom: boolean;

	@Column()
	message: string;

	@Column()
	timeStamp: string;
}