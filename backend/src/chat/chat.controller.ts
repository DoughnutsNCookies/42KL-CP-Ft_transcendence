import { ChannelDTO, GetChannelQueryDTO, GetMessageQueryDTO, MemberDTO, MessageDTO, PatchRoomBodyDTO, PatchRoomMemberBodyDTO, PostRoomBodyDTO, PostRoomMemberBodyDTO } from "src/dto/chat.dto";
import { Body, Controller, Get, Headers, Param, Post, Patch, Query, Delete } from "@nestjs/common";
import { ApiCommonHeader } from "src/ApiCommonHeader/ApiCommonHeader.decorator";
import { ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guard/AuthGuard";
import { ChatService } from "./chat.service";
import { UseGuards } from "@nestjs/common";
import { TFAGuard } from "src/guard/TFAGuard";

@ApiTags("Chat")
@Controller("chat")
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Get('member/:channelId')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid channelId - member is not found in that channelId"])
	@ApiOkResponse({ description: "Returns the member data of the user in the channel", type: MemberDTO})
	getMyMemberData(@Headers('Authorization') accessToken: string, @Param('channelId') channelId: string): Promise<any> {
		return this.chatService.getMyMemberData(true, accessToken, Number(channelId));
	}

	@Get('channel')
	@UseGuards(AuthGuard)
	@ApiCommonHeader()
	@ApiOkResponse({ description: "Returns all the DM channels of the user", type: [ChannelDTO] })
	getAllChannel(@Headers('Authorization') accessToken: string, @Query() query: GetChannelQueryDTO): Promise<[ChannelDTO]> {
		return this.chatService.getAllChannel(accessToken, query.startWith, Number(query.perPage), Number(query.page));
	}

	@Get('channel/public')
	@UseGuards(AuthGuard)
	@ApiCommonHeader()
	@ApiOkResponse({ description: "Returns all the public channels", type: [ChannelDTO]})
	getAllPublicChannel(@Headers('Authorization') accessToken: string, @Query() query: GetChannelQueryDTO): Promise<[ChannelDTO]> {
		return this.chatService.getAllPublicChannel(accessToken, query.startWith, Number(query.perPage), Number(query.page));
	}

	@Get('channel/member/:channelId')
	@UseGuards(AuthGuard)
	@ApiCommonHeader()
	@ApiOkResponse({ description: "Returns all the channels of the user", type: [MemberDTO]})
	getAllChannelMember(@Headers('Authorization') accessToken: string, @Param('channelId') channelId: string): Promise<[MemberDTO]> {
		return this.chatService.getAllChannelMember(accessToken, Number(channelId));
	}

	@Get('message/:channelId')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid body - body must include channelId(number)", "Invalid channelId - channel does not exist", "Invalid channelId - you are not friends with this user", "Invalid channelId - member is not found in that channelId", "Invalid channelId - you are banned from this channel"])
	@ApiOkResponse({ description: "Returns all the messages of the user in the channel", type: [MessageDTO]})
	getAllChannelMessage(@Headers('Authorization') accessToken: string, @Param('channelId') channelId: string, @Query() query: GetMessageQueryDTO): Promise<any> {
		return this.chatService.getAllChannelMessage(accessToken, Number(channelId), Number(query.perPage), Number(query.page));
	}

	@Post('room')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid body - body must include channelName(string), isPrivate(boolean) and password(null | string)", "Invalid body - password must be null if isPrivate is true", "Invalid password - password must be between 1-16 characters", "Invalid channelName - channelName must be between 1-16 characters"])
	@ApiCreatedResponse({ description: "Returns the newly created room", type: ChannelDTO })
	createRoom(@Headers('Authorization') accessToken: string, @Body() body: PostRoomBodyDTO): any {
		return this.chatService.createRoom(accessToken, body.channelName, body.isPrivate, body.password);
	}

	@Patch('room')
	@UseGuards(TFAGuard)
	@ApiHeader({ name: 'OTP', description: 'OTP 6 digit code (eg. 123456)', required: true })
	@ApiCommonHeader(["Invalid body - body must include channelName(string), isPrivate(boolean) and password(null | string)", "Invalid body - password must be null if isPrivate is true", "Invalid channelName - channelName must be between 1-16 characters", "Invalid channelId - channel is not found", "Invalid password - password does not match", "Invalid password - password must be between 1-16 characters", "Invalid channelId - requires owner privileges"])
	@ApiOkResponse({ description: "Returns the updated room (requires owner privileges, TFA if enabled)", type: ChannelDTO })
	updateRoom(@Headers('Authorization') accessToken: string, @Body() body: PatchRoomBodyDTO): any {
		return this.chatService.updateRoom(accessToken, body.channelId, body.channelName, body.isPrivate, body.oldPassword, body.newPassword);
	}

	@Delete('room/:channelId')
	@UseGuards(TFAGuard)
	@ApiCommonHeader()
	@ApiHeader({ name: 'OTP', description: 'OTP 6 digit code (eg. 123456)', required: true })
	@ApiOkResponse({ description: "Returns the deleted room (requires owner privileges, TFA if enabled)", type: ChannelDTO})
	deleteRoom(@Headers('Authorization') accessToken: string, @Param('channelId') channelId: string): any {
		return this.chatService.deleteRoom(accessToken, Number(channelId));
	}

	@Post('room/member')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid channelId - channel is not found", "Invalid channelId - requires admin privileges", "Invalid intraName - you are not friends with this user", "Invalid intraName - user is already a member of this channel"])
	@ApiCreatedResponse({ description: "Returns the newly added member. RULES: 1. Private rooms - you need to be admin to invite 2. Public invite - member options must all be set to false for self-join. 3. Public password - self join require password", type: MemberDTO })
	addMember(@Headers('Authorization') accessToken: string, @Body() body: PostRoomMemberBodyDTO): any {
		return this.chatService.addMember(accessToken, body.channelId, body.intraName, body.isAdmin, body.isBanned, body.isMuted, body.password);
	}

	@Patch('room/member')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid body - body must include channelId(number), intraName(string), isAdmin(boolean), isBanned(boolean) and isMuted(boolean)", "Invalid channelId - requires admin privileges", "Invalid channelId - channel is not found", "Invalid intraName - user is not a member of this channel", "Invalid intraName - cannot update owner member", "Invalid intraName - cannot update admin member without owner privileges"])
	@ApiOkResponse({ description: "Returns the updated member (requires admin privileges)", type: MemberDTO})
	updateMember(@Headers('Authorization') accessToken: string, @Body() body: PatchRoomMemberBodyDTO): any {
		return this.chatService.updateMember(accessToken, body.channelId, body.intraName, body.isAdmin, body.isBanned, body.isMuted);
	}

	@Delete('room/member/:channelId/:intraName')
	@UseGuards(AuthGuard)
	@ApiCommonHeader(["Invalid body - body must include channelId(number) and intraName(string)", "Invalid channelId - requires admin privileges", "Invalid channelId - channel is not found", "Invalid intraName - user is not a member of this channel"])
	@ApiOkResponse({ description: "Returns the deleted member (requires admin privileges)", type: MemberDTO})
	deleteMember(@Headers('Authorization') accessToken: string, @Param('channelId') channelId: string, @Param('intraName') intraName: string): any {
		return this.chatService.deleteMember(accessToken, Number(channelId), intraName);
	}
}