import { ApiProperty } from "@nestjs/swagger";
import { UserDTO } from "./user.dto";

export class ChannelDTO {
	constructor(owner: UserDTO, channelName: string, isPrivate: boolean, password: null | string, isRoom: boolean, channelId: number, newMessage: boolean) {
		this.owner = owner;
		this.channelName = channelName;
		this.isPrivate = isPrivate;
		this.password = password;
		this.isRoom = isRoom;
		this.channelId = channelId;
		this.newMessage = newMessage;
	}

	@ApiProperty({ example: UserDTO})
	owner: UserDTO;

	@ApiProperty({ example: "Doughnuts'" })
	channelName: string;

	@ApiProperty({ example: true })
	isPrivate: boolean;

	@ApiProperty({ example: "password123" })
	password: null | string;

	@ApiProperty({ example: true })
	isRoom: boolean;

	@ApiProperty({ example: 42 })
	channelId: number;

	@ApiProperty({ example: true })
	newMessage: boolean;

	@ApiProperty({ example: 42 })
	memberCount: number;
}

export class MemberDTO {
	constructor(user: UserDTO, channel: ChannelDTO, isAdmin: boolean, isBanned: boolean, isMuted: boolean, lastRead: boolean, memberId: number) {
		this.user = user;
		this.channel = channel;
		this.isAdmin = isAdmin;
		this.isBanned = isBanned;
		this.isMuted = isMuted;
		this.lastRead = lastRead;
		this.memberId = memberId;
	}

	@ApiProperty({ example: UserDTO })
	user: UserDTO;

	@ApiProperty({ example: ChannelDTO })
	channel: ChannelDTO;

	@ApiProperty({ example: true })
	isAdmin: boolean;

	@ApiProperty({ example: false })
	isBanned: boolean;

	@ApiProperty({ example: false })
	isMuted: boolean;

	@ApiProperty({ example: "2023-04-01T00:00:00.000Z" })
	lastRead: boolean;

	@ApiProperty({ example: 42 })
	memberId: number;
}

export class MessageDTO {
	constructor(senderChannel: ChannelDTO, receiverChannel: ChannelDTO, isRoom: boolean, message: string, timeStamp: string, messageId: number) {
		this.senderChannel = senderChannel;
		this.receiverChannel = receiverChannel;
		this.isRoom = isRoom;
		this.message = message;
		this.timeStamp = timeStamp;
		this.messageId = messageId;
	}

	@ApiProperty({ example: ChannelDTO })
	senderChannel: ChannelDTO;

	@ApiProperty({ example: ChannelDTO })
	receiverChannel: ChannelDTO;

	@ApiProperty({ example: true })
	isRoom: boolean;

	@ApiProperty({ example: "Hello World!" })
	message: string;

	@ApiProperty({ example: "2023-04-01T00:00:00.000Z" })
	timeStamp: string;

	@ApiProperty({ example: 42 })
	messageId: number;

	@ApiProperty({ example: true })
	hidden: boolean;
}

export class GetChannelQueryDTO {
	@ApiProperty({ description: "Defaults to null", required: false })
	startWith: string;

	@ApiProperty({ description: "Defaults to 50", required: false })
	perPage: number;

	@ApiProperty({ description: "Defaults to 1", required: false })
	page: number;
}

export class GetMessageQueryDTO {
	@ApiProperty({ description: "Defaults to 100", required: false })
	perPage: number;

	@ApiProperty({ description: "Defaults to 1", required: false })
	page: number;
}

export class PostRoomBodyDTO {
	@ApiProperty({ example: "Doughnuts' Room" })
	channelName: string;

	@ApiProperty({ example: true })
	isPrivate: boolean;

	@ApiProperty({ example: "password123" })
	password: null | string;
}

export class PatchRoomBodyDTO {
	@ApiProperty({ example: 42 })
	channelId: number;

	@ApiProperty({ example: "Doughnuts' Room" })
	channelName: string;

	@ApiProperty({ example: true })
	isPrivate: boolean;

	@ApiProperty({ example: "password123" })
	oldPassword: null | string;

	@ApiProperty({ example: "password123" })
	newPassword: null | string;
}

export class PostRoomMemberBodyDTO {
	@ApiProperty({ example: 42 })
	channelId: number;

	@ApiProperty({ example: "schuah" })
	intraName: string;

	@ApiProperty({ example: true })
	isAdmin: boolean;

	@ApiProperty({ example: true })
	isBanned: boolean;

	@ApiProperty({ example: true })
	isMuted: boolean;

	@ApiProperty({ example: "password123" })
	password: null | string;
}

export class PatchRoomMemberBodyDTO {
	@ApiProperty({ example: 42 })
	channelId: number;

	@ApiProperty({ example: "schuah" })
	intraName: string;

	@ApiProperty({ example: true })
	isAdmin: boolean;

	@ApiProperty({ example: true })
	isBanned: boolean;

	@ApiProperty({ example: true })
	isMuted: boolean;
}