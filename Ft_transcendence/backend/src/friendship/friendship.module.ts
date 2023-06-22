import { FriendshipController } from './friendship.controller';
import { Friendship } from 'src/entity/friendship.entity';
import { FriendshipService } from './friendship.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { FriendshipGateway } from './friendship.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship])],
  providers: [FriendshipService, FriendshipGateway],
  controllers: [FriendshipController]
})
export class FriendshipModule {}
