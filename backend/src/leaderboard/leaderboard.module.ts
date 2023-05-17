import { Module } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
  providers: [LeaderboardService],
  controllers: [LeaderboardController]
})
export class LeaderboardModule {}
