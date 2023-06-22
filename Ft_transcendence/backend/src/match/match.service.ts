import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from 'src/entity/match.entity';
import { User } from 'src/entity/users.entity';
import { Injectable } from '@nestjs/common';
import { Repository, Not } from "typeorm";

@Injectable()
export class MatchService {
	constructor(@InjectRepository(Match) private matchRepository: Repository<Match>, @InjectRepository(User) private userRepository: Repository<User>, private userService: UserService) { }

	async createNewMatch(player1: User, player2: User, player1Score: number, player2Score: number, winner: string, gameType: string, wonBy: string) {
		let newMatch = new Match(player1, player2, player1Score, player2Score, winner, gameType, wonBy);
		await this.matchRepository.save(newMatch);
	}

	async getMatchesByIntraName(intraName: string, perPage?: number, page?: number) {
		perPage = Number(perPage);
		page = Number(page);
		let take = (perPage !== undefined && perPage > 0) ? (perPage >= 100 ? 100 : perPage) : 100;
		let skip = (page !== undefined && page >= 0) ? (page * take) : 0;

		const MATCH_DATA = await this.matchRepository.find({
			where: [
				{ player1: { intraName: intraName }},
				{ player2: { intraName: intraName }}
			],
			relations: { player1: true, player2: true },
			order: {
				matchDate: "DESC"
			},
			skip: skip,
			take: take
		});
		return MATCH_DATA;
	}

	async getStatsByIntraName(intraName: string) {
		const WIN_COUNT = await this.matchRepository.count({
			where: [
				{ player1: { intraName: intraName }, winner: intraName },
				{ player2: { intraName: intraName }, winner: intraName }
			],
		});

		const LOSE_COUNT = await this.matchRepository.count({
			where: [
				{ player1: { intraName: intraName }, winner: Not(intraName) },
				{ player2: { intraName: intraName }, winner: Not(intraName) }
			]
		});
	
		const MATCH_DATA = await this.getMatchesByIntraName(intraName, 100, 0);
		const wins: string [] = [];
		const losses: string [] = [];
		for (const match of MATCH_DATA) {
			if (intraName === match.player1.intraName) {
				if (intraName === match.winner)
					wins.push(match.player2.intraName);
				else
					losses.push(match.player2.intraName);
			} else {
				if (intraName === match.winner)
					wins.push(match.player1.intraName);
				else
					losses.push(match.player1.intraName);
			}
		}

		const USER_DATA = await this.userRepository.findOne({ where: { intraName: intraName } });
		const PUNCHING_BAG_NAME = this.getMostCommonPlayer(wins);
		const WORST_NIGHTMARE_NAME = this.getMostCommonPlayer(losses);
		let worstNightmare = await this.userRepository.findOne({ where: { intraName: WORST_NIGHTMARE_NAME } });
		if (worstNightmare === null)
			worstNightmare = USER_DATA;
		let punchingBag = await this.userRepository.findOne({ where: { intraName: PUNCHING_BAG_NAME } });
		if (punchingBag === null)
			punchingBag = USER_DATA;
		return { winStreak: USER_DATA.winStreak, highestElo: USER_DATA.highestElo, win: WIN_COUNT, lose: LOSE_COUNT, worst_nightmare: this.userService.hideData(worstNightmare), punching_bag: this.userService.hideData(punchingBag) };
	}

	private getMostCommonPlayer(players: string[]): string {
		const playerCount = new Map<string, number>();

		for (const player of players) {
      const count = playerCount.get(player) || 0;
      playerCount.set(player, count + 1);
    }

    const sortedPlayers = [...playerCount.entries()].sort((a, b) => b[1] - a[1]);
    return sortedPlayers.length > 0 ? sortedPlayers[0][0] : "";
	}
}
