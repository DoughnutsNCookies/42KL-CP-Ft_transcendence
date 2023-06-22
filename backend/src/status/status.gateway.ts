import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { StatusService } from './status.service';
import { Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guard/AuthGuard';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: {origin: '*'} })
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor (private readonly statusService: StatusService) {}
	
	@WebSocketServer() server: any;

	@UseGuards(AuthGuard)
	async handleConnection(client: any) {
		await this.statusService.userConnect(client, this.server);
	}
	
	@UseGuards(AuthGuard)
	async handleDisconnect(client: any) {
		await this.statusService.userDisconnect(client, this.server);
	}
	
	@UseGuards(AuthGuard)
	@SubscribeMessage('changeStatus')
	async changeStatus(@ConnectedSocket() client: Socket, @Body() body: any) {
		await this.statusService.changeStatus(client, this.server, body.newStatus);
	}
	
	@UseGuards(AuthGuard)
	@SubscribeMessage('statusRoom')
	async joinStatusRoom(@ConnectedSocket() client: Socket, @Body() body: any) {
		await this.statusService.statusRoom(client, this.server, body.intraName, body.joining);
	}
}