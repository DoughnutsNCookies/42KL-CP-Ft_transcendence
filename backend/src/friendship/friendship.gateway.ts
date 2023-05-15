import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ConnectedSocket } from '@nestjs/websockets';
import { FriendshipService } from './friendship.service';
import { AuthGuard } from 'src/guard/AuthGuard';
import { UseGuards, Body } from '@nestjs/common';

@WebSocketGateway({ cors: {origin: '*'}, namespace: '/friendship'})
export class FriendshipGateway implements OnGatewayConnection {
	constructor (private readonly friendshipService: FriendshipService) {}

	@WebSocketServer() server: any;

	@UseGuards(AuthGuard)
	async handleConnection(client: any) {
		await this.friendshipService.userConnect(client);
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('friendshipRoom')
	async friendshipRoom(@ConnectedSocket() client: any, @Body() body: any) {
		await this.friendshipService.friendshipRoom(client, this.server, body.intraName);
	}
}
