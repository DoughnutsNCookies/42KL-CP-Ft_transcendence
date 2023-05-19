import { Body, Controller, Get, Headers, Param, Post, Patch, Delete } from "@nestjs/common";
import { ChannelDTO, GetMessageBodyDTO, MemberDTO, MessageDTO } from "src/dto/chat.dto";
import { ApiCommonHeader } from "src/ApiCommonHeader/ApiCommonHeader.decorator";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guard/AuthGuard";
import { ChatService } from "./chat.service";
import { UseGuards } from "@nestjs/common";

@ApiTags("Chat")
@Controller("chat")
export class ChatController {
	constructor (private readonly chatService: ChatService) {}
	
	@Get('member/:channelID')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid channelId - member is not found in that channelId"])
	@ApiOkResponse({ description: "Returns the member data of the user in the channel", type: MemberDTO})
	getMyMemberData(@Headers('Authorization') accessToken: string, @Param('channelID') channelId: number): Promise<any> {
		return this.chatService.getMyMemberData(accessToken, channelId);
	}

	@Get('dm/channel')
	@UseGuards(AuthGuard)
	@ApiCommonHeader()
	@ApiOkResponse({ description: "Returns all the DM channels of the user", type: [ChannelDTO]})
	getAllDMChannel(@Headers('Authorization') accessToken: string): Promise<[ChannelDTO]> {
		return this.chatService.getAllDMChannel(accessToken);
	}

	@Get('dm/message/:channelID')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid body - body must include channelId(number)", "Invalid channelId - channel is not found", "Invalid channelId - you are not friends with this user"])
	@ApiOkResponse({ description: "Returns all the messages of the user in the channel", type: [MessageDTO]})
	getMyDMMessages(@Headers('Authorization') accessToken: string, @Param('channelID') channelId: number, @Body() body: GetMessageBodyDTO): Promise<any> {
		return this.chatService.getMyDMMessages(accessToken, channelId, body.perPage, body.page);
	}

	@Post('room')
	@UseGuards(AuthGuard)
	createRoom(@Headers('Authorization') accessToken: string, @Body() body: any): any {
		return this.chatService.createRoom(accessToken, body.channelName, body.isPrivate, body.password);
	}

	@Patch('room')
	@UseGuards(AuthGuard)
	updateRoom(@Headers('Authorization') accessToken: string, @Body() body: any): any {
		return this.chatService.updateRoom(accessToken, body.channelId, body.channelName, body.isPrivate, body.oldPassword, body.newPassword);
	}

	@Delete('room')
	@UseGuards(AuthGuard)
	deleteRoom(@Headers('Authorization') accessToken: string, @Body() body: any): any {
		return this.chatService.deleteRoom(accessToken, body.channelId);
	}
}