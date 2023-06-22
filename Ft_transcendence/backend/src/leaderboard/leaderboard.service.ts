import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { User } from "../entity/users.entity";
import { LeaderboardResponseDTO } from 'src/dto/leaderboard.dto';

@Injectable()
export class LeaderboardService {
	constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

	async getLeaderboard(hallOfFame: boolean, perPage?: number, page?: number): Promise<LeaderboardResponseDTO[]> {
		perPage = Number(perPage);
		page = Number(page);
		let take = (perPage !== undefined && perPage > 0) ? (perPage >= 100 ? 100 : perPage) : 100;
		let skip = (page !== undefined && page >= 0) ? (page * take) : 0;

		const LEADERBOARD_DATA = await this.userRepository.find({
			select: {
				userName: true,
				intraName: true,
				elo: true
			},
			order: {
				elo: hallOfFame ? "DESC" : "ASC"
			},
			skip: skip,
			take: take
		});
		return LEADERBOARD_DATA;
	}
}
