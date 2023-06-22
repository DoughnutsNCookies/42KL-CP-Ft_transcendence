import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody, OnGatewayConnection } from "@nestjs/websockets"
import { AuthGuard } from "src/guard/AuthGuard";
import { ChatService } from "./chat.service"
import { UseGuards } from "@nestjs/common";
import { Socket, Server } from "socket.io"

@WebSocketGateway({ cors: { origin: "*" }, namespace : "/chat", })
export class ChatGateway implements OnGatewayConnection {
	constructor (private readonly chatService: ChatService) {}

	@WebSocketServer()
	server: Server;

	@UseGuards(AuthGuard)
	async handleConnection(client: any) {
		await this.chatService.userConnect(client);
	}
	
	@UseGuards(AuthGuard)
	@SubscribeMessage('message')
	async message(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
		await this.chatService.message(client, this.server, body.channelId, body.message);
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('read')
	async read(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
		await this.chatService.read(client, this.server, body.channelId);
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('typing')
	async typing(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
		await this.chatService.typing(client, this.server, body.channelId);
	}
}