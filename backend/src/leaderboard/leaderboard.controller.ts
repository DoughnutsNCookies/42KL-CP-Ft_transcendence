import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { AuthGuard } from 'src/guard/AuthGuard';
import { LeaderboardInputDTO, LeaderboardResponseDTO } from 'src/dto/leaderboard.dto'
import { ApiTags, ApiOkResponse } from '@nestjs/swagger'

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
	constructor(private readonly leaderboardService: LeaderboardService) {}

	@ApiOkResponse({ type: [LeaderboardResponseDTO] })
	@Get('hallOfFame')
	@UseGuards(AuthGuard)
	async getHallOfFame(@Body() body: LeaderboardInputDTO): Promise<LeaderboardResponseDTO[]> {
		return await this.leaderboardService.getLeaderboard(true, body.perPage, body.page);
	}
	
	@ApiOkResponse({ type: [LeaderboardResponseDTO] })
	@Get('hallOfShame')
	@UseGuards(AuthGuard)
	async getHallOfShame(@Body() body: LeaderboardInputDTO): Promise<LeaderboardResponseDTO[]> {
		return await this.leaderboardService.getLeaderboard(false, body.perPage, body.page);
	}
}
