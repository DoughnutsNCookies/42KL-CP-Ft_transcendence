import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity( { name: 'active' } )
export class Active {
	constructor(socketId: string, intraName: string, status: string) {
		this.socketId = socketId;
		this.intraName = intraName;
		this.status = status;
	}

	@PrimaryColumn()
	socketId: string;

	@Column()
	intraName: string;

	@Column()
	status: string;
}