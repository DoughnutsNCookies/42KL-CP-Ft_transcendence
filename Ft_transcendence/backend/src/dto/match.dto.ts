import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserDTO } from './user.dto';

export class MatchInputDTO {
	@ApiPropertyOptional({ example: 3 })
	perPage?: number;

	@ApiPropertyOptional({ example: 0 })
	page?: number;
}

export class MatchResponseDTO {
	@ApiProperty({ type: UserDTO })
	player1: UserDTO;

	@ApiProperty({ type: UserDTO })
	player2: UserDTO;

	@ApiProperty({ example: 5 })
	player1Score: number;

	@ApiProperty({ example: 3 })
	player2Score: number;

	@ApiProperty({ example: "itan" })
	winner: string;

	@ApiProperty({ example: "standard" })
	gameType: string;

	@ApiProperty({ example: "score" })
	wonBy: string;

	@ApiProperty({ example: 1 })
	matchId: number;

	@ApiProperty({ example: "2023-05-16T14:39:35.193Z" })
	matchDate: Date;
}

export class MatchStatsResponseDTO {
	@ApiProperty({ example: 100 })
	winStreak: number;

	@ApiProperty({ example: 4242 })
	highestElo: number;

	@ApiProperty({ example: 69 })
	win: number;

	@ApiProperty({ example: 42 })
	lose: number;

	@ApiProperty({ type: UserDTO })
	worst_nightmare: UserDTO;

	@ApiProperty({ type: UserDTO })
	punching_bag: UserDTO;
}