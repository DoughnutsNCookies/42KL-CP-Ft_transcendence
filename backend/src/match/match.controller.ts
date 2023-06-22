import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { AuthGuard } from 'src/guard/AuthGuard';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger'
import { MatchInputDTO, MatchResponseDTO, MatchStatsResponseDTO } from 'src/dto/match.dto';

@ApiTags('Match')
@Controller('match')
export class MatchController {
	constructor(private readonly matchService: MatchService) {}

	@ApiOkResponse({ type: [MatchResponseDTO] })
	@Get(':intraName')
	@UseGuards(AuthGuard)
	getMatchesByIntraName(@Param('intraName') intraName: string, @Query() query: MatchInputDTO): any {
		return this.matchService.getMatchesByIntraName(intraName, query.perPage, query.page);
	}

	@ApiOkResponse({ type: MatchStatsResponseDTO })
	@Get('stats/:intraName')
	@UseGuards(AuthGuard)
	getStatsByIntraName(@Param('intraName') intraName: string): any {
		return this.matchService.getStatsByIntraName(intraName);
	}
}
