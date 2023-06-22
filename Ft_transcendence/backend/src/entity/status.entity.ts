import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity( { name: 'status' } )
export class Status {
  constructor(intraName: string, clientId: string, status: string) {
    this.intraName = intraName;
    this.clientId = clientId;
    this.status = status;
  }

  @PrimaryColumn()
  intraName: string;
  
  @Column()
  clientId: string;

  @Column()
	status: string;
}
