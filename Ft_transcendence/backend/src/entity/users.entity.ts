import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity( { name: 'users' } )
export class User {
  constructor(intraId: number, userName: string, intraName: string, email: string, elo: number, accessToken: string, avatar: string, tfaSecret: string, winning: boolean, highestElo: number, winStreak: number) {
    this.intraId = intraId;
    this.userName = userName;
    this.intraName = intraName;
    this.email = email;
    this.elo = elo;
    this.accessToken = accessToken;
    this.avatar = avatar;
    this.tfaSecret = tfaSecret;
    this.winning = winning;
    this.winStreak = winStreak;
    this.highestElo = highestElo;
  }

  @PrimaryColumn()
  intraId: number;

  @Column()
  userName: string;

  @Column()
  intraName: string;

  @Column()
  email: string;

  @Column()
  elo: number;

  @Column()
	accessToken: string;

  @Column()
  avatar: string;

  @Column({ nullable: true })
  tfaSecret: string;

  @Column()
  winning: boolean;

  @Column()
  highestElo: number;

  @Column()
  winStreak: number;
}
