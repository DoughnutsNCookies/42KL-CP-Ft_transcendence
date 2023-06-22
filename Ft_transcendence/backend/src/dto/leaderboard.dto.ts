import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'

export class LeaderboardInputDTO {
	@ApiPropertyOptional({ example: 100 })
	perPage?: number;

	@ApiPropertyOptional({ example: 0 })
	page?: number;
}

export class LeaderboardResponseDTO {
	@ApiProperty({ example: "schuah" })
	userName: string;

	@ApiProperty({ example: 9999 })
	elo: number;
}