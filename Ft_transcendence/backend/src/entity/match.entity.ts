import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity( { name: "matches" } )
export class Match {
	constructor(player1: User, player2: User, player1Score: number, player2Score: number, winner: string, gameType: string, wonBy: string) {
		this.player1 = player1;
		this.player2 = player2;
		this.player1Score = player1Score;
		this.player2Score = player2Score;
		this.winner = winner;
		this.gameType = gameType;
		this.wonBy = wonBy;
	}

	@PrimaryGeneratedColumn()
	matchId: number;

	@ManyToOne(() => User)
	player1: User;

	@ManyToOne(() => User)
	player2: User;

	@Column()
	player1Score: number;

	@Column()
	player2Score: number;

	@Column()
	winner: string;

	@Column()
	gameType: string;

	@Column()
	wonBy: string;

	@CreateDateColumn()
	matchDate: Date;
}