import { FriendshipService } from "src/friendship/friendship.service";
import { Friendship } from "src/entity/friendship.entity";
import { ChannelDTO, MemberDTO, MessageDTO } from "src/dto/chat.dto";
import { Channel } from "src/entity/channel.entity";
import { Message } from "src/entity/message.entity";
import { UserService } from "src/user/user.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Member } from "src/entity/member.entity";
import { ErrorDTO } from "src/dto/error.dto";
import { Injectable } from "@nestjs/common";
import { Repository, In } from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
	constructor(@InjectRepository(Channel) private channelRepository: Repository<Channel>, @InjectRepository(Member) private memberRepository: Repository<Member>, @InjectRepository(Message) private messageRepository: Repository<Message>, private userService: UserService, private friendshipService: FriendshipService) { }

	// Used to connect to own channel
	async userConnect(client: any): Promise<any> {
		try {
			const USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
			let dmRoom = await this.channelRepository.findOne({ where: { channelName: USER_DATA.intraName, isRoom: false } });
			if (dmRoom === null)
				dmRoom = await this.channelRepository.save(new Channel(USER_DATA, USER_DATA.intraName, true, null, false, false, 1));
			client.join(dmRoom.channelId);
		} catch {
			return;
		}
	}

	// Used to send message to a channel
	async message(client: any, server: any, channelId: number, message: string): Promise<any> {
		const USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
		const MY_CHANNEL = await this.channelRepository.findOne({ where: { channelName: USER_DATA.intraName, isRoom: false }, relations: ['owner'] });
		if (message === undefined || channelId === undefined)
			return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, "Invalid body - body must include channelId(string) and message(string)"));

		if (channelId === MY_CHANNEL.channelId)
			return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, "Invalid channelId - you no friends so you DM yourself?"));
		if (message.length > 1024 || message.length < 1)
			return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, "Invalid message - message is must be between 1-1024 characters only"));

		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId }, relations: ['owner'] });
		if (CHANNEL === null)
			return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, "Invalid channelId - channel is not found"));
		const MY_MEMBER = await this.getMyMemberData(false, client.handshake.headers.authorization, CHANNEL.channelId)
		if (MY_MEMBER.error !== undefined)
			return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, MY_MEMBER.error));
		if (MY_MEMBER.isMuted === true || MY_MEMBER.isBanned === true)
			return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, "Invalid channelId - you are muted or banned from this channel"));

		const NEW_MESSAGE = new Message(MY_CHANNEL, CHANNEL, CHANNEL.isRoom, message, new Date().toISOString());
		if (CHANNEL.isRoom === true) {
			await this.messageRepository.save(NEW_MESSAGE);
			const MEMBERS = await this.memberRepository.find({ where: { channel: { channelId: CHANNEL.channelId } }, relations: ['user', 'channel'] });
			for (let member of MEMBERS) {
				const MEMBER_CHANNEL = await this.channelRepository.findOne({ where: { channelName: member.user.intraName, isRoom: false }, relations: ['owner'] });
				if (MEMBER_CHANNEL.owner.intraName === USER_DATA.intraName)
					continue;
				server.to(MEMBER_CHANNEL.channelId).emit("message", this.userService.hideData(NEW_MESSAGE));
			}
		} else {
			const FRIENDSHIP = await this.friendshipService.getFriendshipStatus(client.handshake.headers.authorization, CHANNEL.owner.intraName)
			if (FRIENDSHIP === null || FRIENDSHIP.status !== "ACCEPTED")
				return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, "Invalid channelId - you are not friends with this user"));
			await this.messageRepository.save(NEW_MESSAGE);
			MY_MEMBER.lastRead = new Date().toISOString();
			await this.memberRepository.save(MY_MEMBER);
			server.to(CHANNEL.channelId).emit("message", this.userService.hideData(NEW_MESSAGE));
		}
		if (message === "/invite")
			server.to(MY_CHANNEL.channelId).emit("message", this.userService.hideData(NEW_MESSAGE));
	}

	// Marks a message as read
	async read(client: any, server: any, channelId: number): Promise<any> {
		const USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
		const MY_CHANNEL = await this.channelRepository.findOne({ where: { channelName: USER_DATA.intraName, isRoom: false }, relations: ['owner'] });
		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId }, relations: ['owner'] });
		if (CHANNEL === null)
			return server.to(MY_CHANNEL.channelId).emit("read", new ErrorDTO(false, "Invalid channelId - channel is not found"));

		const MY_MEMBER = await this.getMyMemberData(false, client.handshake.headers.authorization, channelId)
		if (MY_MEMBER.error !== undefined)
			return server.to(MY_CHANNEL.channelId).emit("read", new ErrorDTO(false, "Invalid channelId - you are not a member of this channel"));
		if (MY_MEMBER.isBanned === true)
			return server.to(MY_CHANNEL.channelId).emit("message", new ErrorDTO(false, "Invalid channelId - you are not a member of this channel"));
		if (CHANNEL.isRoom === false) {
			const FRIENDSHIP = await this.friendshipService.getFriendshipStatus(client.handshake.headers.authorization, CHANNEL.owner.intraName);
			if (FRIENDSHIP === null || FRIENDSHIP.status !== "ACCEPTED")
				return server.to(MY_CHANNEL.channelId).emit("read", new ErrorDTO(false, "Invalid channelId - you are not a member of this channel"));
		}
		MY_MEMBER.lastRead = new Date().toISOString();
		await this.memberRepository.save(MY_MEMBER);
	}

	// Ping the channel that the user is typing to that channel
	async typing(client: any, server: any, channelId: number): Promise<any> {
		const USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
		const MY_CHANNEL = await this.channelRepository.findOne({ where: { channelName: USER_DATA.intraName, isRoom: false }, relations: ['owner'] });
		if (channelId === MY_CHANNEL.channelId)
			return server.to(MY_CHANNEL.channelId).emit("typing", new ErrorDTO(false, "Invalid channelId - you no friends so you DM yourself?"));
		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId }, relations: ['owner'] });
		if (CHANNEL === null)
			return server.to(MY_CHANNEL.channelId).emit("typing", new ErrorDTO(false, "Invalid channelId - channel is not found"));

		const MY_MEMBER = await this.getMyMemberData(false, client.handshake.headers.authorization, channelId);
		if (MY_MEMBER.error !== undefined)
			return server.to(MY_CHANNEL.channelId).emit("read", new ErrorDTO(false, "Invalid channelId - you are not a member of this channel"));
		if (MY_MEMBER.isBanned === true || MY_MEMBER.isMuted === true)
			return server.to(MY_CHANNEL.channelId).emit("typing", new ErrorDTO(false, "Invalid channelId - you are muted or banned from this channel"));
		if (CHANNEL.isRoom === false) {
			const FRIENDSHIP = await this.friendshipService.getFriendshipStatus(client.handshake.headers.authorization, CHANNEL.owner.intraName);
			if (FRIENDSHIP === null || FRIENDSHIP.status !== "ACCEPTED")
				return server.to(MY_CHANNEL.channelId).emit("typing", new ErrorDTO(false, "Invalid channelId - you are not a member of this channel"));
		}
		const MEMBERS = CHANNEL.isRoom === true ? await this.memberRepository.find({ where: { channel: { channelId: CHANNEL.channelId } }, relations: ['user', 'channel'] }) : await this.memberRepository.find({ where: { channel: { channelId: MY_CHANNEL.channelId } }, relations: ['user', 'channel'] });
		if (CHANNEL.isRoom === false) {
			return server.to(channelId).emit("typing", { channel: this.userService.hideData(MY_CHANNEL), userName: USER_DATA.userName });
		}
		for (let member of MEMBERS) {
			if (member.user.intraName === USER_DATA.intraName)
				continue;
			const MEMBER_CHANNEL = await this.channelRepository.findOne({ where: { channelName: member.user.intraName, isRoom: false }, relations: ['owner'] });
			server.to(MEMBER_CHANNEL.channelId).emit("typing", { channel: this.userService.hideData(CHANNEL), userName: USER_DATA.userName });
		}
	}

	// Retrives user's member data of that channel
	async getMyMemberData(status: boolean, accessToken: string, channelId: number): Promise<any> {
		if (Number.isNaN(channelId))
			new ErrorDTO(status, "Invalid channelId - you are not a member of this channel")
		const USER_DATA = await this.userService.getMyUserData(accessToken);
		const MEMBER_DATA = await this.memberRepository.findOne({ where: { user: { intraName: USER_DATA.intraName }, channel: { channelId: channelId } }, relations: ['user', 'channel', 'channel.owner'] });
		return MEMBER_DATA === null ? new ErrorDTO(status, "Invalid channelId - you are not a member of this channel") : this.userService.hideData(MEMBER_DATA);
	}

	// Retrives all channel of the user
	async getAllChannel(accessToken: string, startWith: string, perPage: number = 50, page: number = 1): Promise<[ChannelDTO]> {
		if (Number.isNaN(perPage) === true)
			perPage = 50;
		if (Number.isNaN(page) === true)
			page = 1;
		const USER_DATA = await this.userService.getMyUserData(accessToken);
		const MY_CHANNEL = await this.channelRepository.findOne({ where: { channelName: USER_DATA.intraName, isRoom: false }, relations: ['owner'] });
		const MY_MEMBERS = await this.memberRepository.find({ where: { user: { intraName: USER_DATA.intraName } }, relations: ['user', 'channel', 'channel.owner'] });
		let channel = [];
		for (let member of MY_MEMBERS) {
			if (member.isBanned === true || (startWith !== undefined && member.channel.channelName.toLowerCase().startsWith(startWith.toLowerCase()) === false))
				continue;
			const MEMBERS = await this.memberRepository.find({ where: { channel: { channelId: member.channel.channelId } }, relations: ['user', 'channel'] });
			const DM_CHANNEL = await this.channelRepository.find({ where: { channelName: In(MEMBERS.map(memberInChannel => memberInChannel.user.intraName)), isRoom: false }, relations: ['owner'] });
			let lastMessage = await this.getAllChannelMessage(accessToken, member.channel.channelId, 1, 1);
			lastMessage = lastMessage.length === 0 ? null : lastMessage[0];
			member.channel.newMessage = lastMessage === null ? false : lastMessage.timeStamp > member.lastRead;
			member.channel.owner.accessToken = lastMessage === null ? (member.channel.isRoom === true ? member.lastRead : new Date(-8640000000000000).toISOString()) : lastMessage.timeStamp;
			channel.push(member.channel);
		}
		channel = channel.sort((a, b) => new Date(b.owner.accessToken).getTime() - new Date(a.owner.accessToken).getTime());
		channel = channel.length - (page * perPage) < 0 ? channel.slice(0, Math.max(0, perPage + channel.length - (page * perPage))) : channel.slice(channel.length - (page * perPage), channel.length - ((page - 1) * perPage))
		return this.userService.hideData(channel);
	}

	// Retrives all public channel
	async getAllPublicChannel(accessToken: string, startWith: string, perPage: number = 50, page: number = 1): Promise<[ChannelDTO]> {
		if (Number.isNaN(perPage) === true)
			perPage = 50;
		if (Number.isNaN(page) === true)
			page = 1;
		let channel = [];
		const PUBLIC_CHANNELS = await this.channelRepository.find({ where: { isRoom: true, isPrivate: false }, relations: ['owner'] });
		for (let publicChannel of PUBLIC_CHANNELS) {
			if (startWith !== undefined && publicChannel.channelName.toLowerCase().startsWith(startWith.toLowerCase()) === false)
				continue;
			try {
				await this.getMyMemberData(true, accessToken, publicChannel.channelId);
			} catch {
				channel.push(publicChannel);
			}
		}
		channel = channel.sort((a, b) => new Date(b.owner.accessToken).getTime() - new Date(a.owner.accessToken).getTime());
		channel = channel.length - (page * perPage) < 0 ? channel.slice(0, Math.max(0, perPage + channel.length - (page * perPage))) : channel.slice(channel.length - (page * perPage), channel.length - ((page - 1) * perPage))
		return this.userService.hideData(channel);
	}

	// Retrives all members of a channel
	async getAllChannelMember(accessToken: string, channelId: number): Promise<any> {
		if (Number.isNaN(channelId) === true)
			return [];
		const MY_MEMBER = await this.getMyMemberData(false, accessToken, channelId);
		if (MY_MEMBER.error !== undefined || MY_MEMBER.isBanned === true)
			return [];
		const MEMBERS = await this.memberRepository.find({ where: { channel: { channelId: channelId } }, relations: ['user', 'channel', 'channel.owner'] });
		return this.userService.hideData(MEMBERS);
	}

	// Retrives all messages from a channel
	async getAllChannelMessage(accessToken: string, channelId: number, perPage: number = 100, page: number = 1): Promise<any> {
		if (Number.isNaN(perPage) === true)
			perPage = 100;
		if (Number.isNaN(page) === true)
			page = 1;
		if (Number.isNaN(channelId) === true)
			return new ErrorDTO(true, "Invalid body - body must include channelId(number)");

		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId }, relations: ['owner'] });
		if (CHANNEL === null)
			return new ErrorDTO(true, "Invalid channelId - channel does not exist");
		if (CHANNEL.isRoom === false) {
			const FRIENDSHIP = await this.friendshipService.getFriendshipStatus(accessToken, CHANNEL.owner.intraName)
			if (FRIENDSHIP === null || FRIENDSHIP.status !== "ACCEPTED")
				return new ErrorDTO(true, "Invalid channelId - you are not friends with this user");
		}
		const MY_MEMBER = await this.getMyMemberData(true, accessToken, channelId);
		if (MY_MEMBER.isBanned === true)
			return new ErrorDTO(true, "Invalid channelId - you are banned from this channel");
		const MY_CHANNEL = await this.channelRepository.findOne({ where: { channelName: MY_MEMBER.user.intraName, isRoom: false }, relations: ['owner'] });
		let messages = CHANNEL.isRoom === false
			? await this.messageRepository.find({ where: [{ receiverChannel: { channelId: MY_CHANNEL.channelId }, senderChannel: { channelId: channelId } }, { receiverChannel: { channelId: channelId }, senderChannel: { channelId: MY_CHANNEL.channelId } }], relations: ['senderChannel', 'receiverChannel', 'senderChannel.owner', 'receiverChannel.owner'] })
			: await this.messageRepository.find({ where: { receiverChannel: { channelId: channelId } }, relations: ['senderChannel', 'receiverChannel', 'senderChannel.owner', 'receiverChannel.owner'] });
		messages = messages.length - (page * perPage) < 0 ? messages.slice(0, Math.max(0, perPage + messages.length - (page * perPage))) : messages.slice(messages.length - (page * perPage), messages.length - ((page - 1) * perPage))

		const MEMBERS = await this.memberRepository.find({ where: { channel: { channelId: channelId } }, relations: ['user', 'channel'] });
		const BLOCKED_INTRA_NAME = [];
		for (let member of MEMBERS) {
			const FRIENDSHIP = await this.friendshipService.getFriendshipStatus(accessToken, member.user.intraName);
			if (FRIENDSHIP !== null && FRIENDSHIP.status === "BLOCKED")
				BLOCKED_INTRA_NAME.push(member.user.intraName);
		}
		for (let message of messages)
			message["hidden"] = BLOCKED_INTRA_NAME.includes(message.senderChannel.owner.intraName)
		return this.userService.hideData(messages);
	}

	// Creates a new room
	async createRoom(accessToken: string, channelName: string, isPrivate: boolean, password: string): Promise<any> {
		if (channelName === undefined || isPrivate === undefined || password === undefined)
			return new ErrorDTO(true, "Invalid body - body must include channelName(string), isPrivate(boolean) and password(null | string)");
		if (isPrivate === true && password !== null)
			return new ErrorDTO(true, "Invalid body - password must be null if isPrivate is true");
		if (password !== null) {
			if (password.length < 1 || password.length > 16)
				return new ErrorDTO(true, "Invalid password - password must be between 1-16 characters");
			password = await bcrypt.hash(password, await bcrypt.genSalt(10));
		}
		if (channelName.length < 1 || channelName.length > 16)
			return new ErrorDTO(true, "Invalid channelName - channelName must be between 1-16 characters");
		const USER_DATA = await this.userService.getMyUserData(accessToken);
		const ROOM = new Channel(USER_DATA, channelName, isPrivate, password, true, false, 1);
		await this.channelRepository.save(ROOM);
		await this.memberRepository.save(new Member(USER_DATA, ROOM, true, false, false, new Date().toISOString()));
		return this.userService.hideData(ROOM);
	}

	// Updates room settings
	async updateRoom(accessToken: string, channelId: number, channelName: string, isPrivate: boolean, oldPassword: string, newPassword: string): Promise<any> {
		if (channelId === undefined || channelName === undefined || isPrivate === undefined || newPassword === undefined)
			return new ErrorDTO(true, "Invalid body - body must include channelName(string), isPrivate(boolean) and password(null | string)");
		if (isPrivate === true && newPassword !== null)
			return new ErrorDTO(true, "Invalid body - password must be null if isPrivate is true");
		if (channelName.length < 1 || channelName.length > 16)
			return new ErrorDTO(true, "Invalid channelName - channelName must be between 1-16 characters");
		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId, isRoom: true }, relations: ['owner'] });
		if (CHANNEL === null || CHANNEL.isRoom === false)
			return new ErrorDTO(true, "Invalid channelId - channel is not found");
		if (CHANNEL.password !== null && (oldPassword === null || await bcrypt.compare(oldPassword, CHANNEL.password) === false))
			return new ErrorDTO(true, "Invalid password - password does not match");
		if (newPassword !== null) {
			if (newPassword.length < 1 || newPassword.length > 16)
				return new ErrorDTO(true, "Invalid password - password must be between 1-16 characters");
			newPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
		}

		const MY_MEMBER = await this.getMyMemberData(true, accessToken, channelId);
		if (CHANNEL.owner.intraName !== MY_MEMBER.user.intraName)
			return new ErrorDTO(true, "Invalid channelId - requires owner privileges");

		CHANNEL.channelName = channelName;
		CHANNEL.isPrivate = isPrivate;
		CHANNEL.password = newPassword;
		return this.userService.hideData(await this.channelRepository.save(CHANNEL));
	}

	// Deletes a room
	async deleteRoom(accessToken: string, channelId: number): Promise<any> {
		if (Number.isNaN(channelId) === true)
			return new ErrorDTO(true, "Invalid body - body must include channelId(number)");
		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId, isRoom: true }, relations: ['owner'] });
		if (CHANNEL === null || CHANNEL.isRoom === false)
			return new ErrorDTO(true, "Invalid channelId - channel is not found");
		const MY_MEMBER = await this.getMyMemberData(true, accessToken, channelId);
		if (CHANNEL.owner.intraName !== MY_MEMBER.user.intraName)
			return new ErrorDTO(true, "Invalid channelId - requires owner privileges");
		await this.memberRepository.delete({ channel: { channelId: channelId } });
		await this.messageRepository.delete({ receiverChannel: { channelId: channelId } });
		await this.channelRepository.delete({ channelId: channelId });
		return this.userService.hideData(CHANNEL);
	}

	// Adds a user to a room
	async addMember(accessToken: string, channelId: number, intraName: string, isAdmin: boolean, isBanned: boolean, isMuted: boolean, password: string): Promise<any> {
		if (channelId === undefined || intraName === undefined || isAdmin === undefined || isBanned === undefined || isMuted === undefined || password === undefined)
			return new ErrorDTO(true, "Invalid body - body must include channelId(number), intraName(string), isAdmin(boolean), isBanned(boolean), isMuted(boolean) and password(null | string)");

		const USER_DATA = await this.userService.getMyUserData(accessToken);
		const MY_MEMBER = await this.getMyMemberData(false, accessToken, channelId);
		MY_MEMBER["isAdmin"] = MY_MEMBER.error !== undefined ? false : MY_MEMBER.isAdmin;

		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId }, relations: ['owner'] });
		if (CHANNEL === null || CHANNEL.isRoom === false)
			return new ErrorDTO(true, "Invalid channelId - channel is not found");

		const FRIEND_DATA = await this.userService.getUserDataByIntraName(accessToken, intraName);
		if (FRIEND_DATA.error !== undefined)
			return new ErrorDTO(true, FRIEND_DATA.error);
		const FRIENDSHIP = await this.friendshipService.getFriendshipStatus(accessToken, FRIEND_DATA.intraName);
		if (FRIEND_DATA.intraName !== USER_DATA.intraName && (FRIENDSHIP === null || FRIENDSHIP.status !== "ACCEPTED"))
			return new ErrorDTO(true, "Invalid intraName - you are not friends with this user");
		if (MY_MEMBER.isAdmin === false && (isAdmin === true || isBanned === true || isMuted === true))
			return new ErrorDTO(true, "Invalid channelId - requires admin privileges");

		if (CHANNEL.isPrivate === true && MY_MEMBER.isAdmin === false)
			return new ErrorDTO(true, "Invalid channelId - requires admin privileges");
		else if (MY_MEMBER.isAdmin === false && CHANNEL.password !== null && (password === null || await bcrypt.compare(password, CHANNEL.password) === false))
			return new ErrorDTO(true, "Invalid password - password does not match");
		else if (CHANNEL.isPrivate === false && MY_MEMBER.isAdmin === false && FRIEND_DATA.intraName !== USER_DATA.intraName)
			return new ErrorDTO(true, "Invalid channelId - requires admin privileges");

		const MEMBER = await this.memberRepository.findOne({ where: { user: { intraName: intraName }, channel: { channelId: channelId } } });
		if (MEMBER !== null)
			return new ErrorDTO(true, "Invalid intraName - user is already a member of this channel");
		CHANNEL.memberCount += 1;
		await this.channelRepository.save(CHANNEL);
		return this.userService.hideData(await this.memberRepository.save(new Member(FRIEND_DATA, CHANNEL, isAdmin, isBanned, isMuted, new Date().toISOString())));
	}

	// Updates a user's member settings
	async updateMember(accessToken: string, channelId: number, intraName: string, isAdmin: boolean, isBanned: boolean, isMuted: boolean): Promise<any> {
		if (channelId === undefined || intraName === undefined || isAdmin === undefined || isBanned === undefined || isMuted === undefined)
			return new ErrorDTO(true, "Invalid body - body must include channelId(number), intraName(string), isAdmin(boolean), isBanned(boolean) and isMuted(boolean)");
		const MY_MEMBER = await this.getMyMemberData(true, accessToken, channelId);
		if (MY_MEMBER.isAdmin === false)
			return new ErrorDTO(true, "Invalid channelId - requires admin privileges");

		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId }, relations: ['owner'] });
		if (CHANNEL === null || CHANNEL.isRoom === false)
			return new ErrorDTO(true, "Invalid channelId - channel is not found");

		const MEMBER = await this.memberRepository.findOne({ where: { user: { intraName: intraName }, channel: { channelId: channelId } }, relations: ['user', 'channel', 'channel.owner'] });
		if (MEMBER === null)
			return new ErrorDTO(true, "Invalid intraName - user is not a member of this channel");

		if (CHANNEL.owner.intraName === MEMBER.user.intraName)
			return new ErrorDTO(true, "Invalid intraName - cannot update owner member");
		if (MEMBER.isAdmin === true && CHANNEL.owner.intraName !== MY_MEMBER.user.intraName)
			return new ErrorDTO(true, "Invalid intraName - cannot update admin member without owner privileges");

		MEMBER.isAdmin = isAdmin;
		MEMBER.isBanned = isBanned;
		MEMBER.isMuted = isMuted;
		if (MEMBER.isBanned === true) {
			CHANNEL.memberCount -= 1;
			await this.channelRepository.save(CHANNEL);
		}
		return this.userService.hideData(await this.memberRepository.save(MEMBER));
	}

	// Deletes a user from a room
	async deleteMember(accessToken: string, channelId: number, intraName: string): Promise<any> {
		if (Number.isNaN(channelId) === true || intraName === undefined)
			return new ErrorDTO(true, "Invalid body - body must include channelId(number) and intraName(string)");
		const MY_MEMBER = await this.getMyMemberData(true, accessToken, channelId);
		if (MY_MEMBER.user.intraName !== intraName && MY_MEMBER.isAdmin === false)
			return new ErrorDTO(true, "Invalid channelId - requires admin privileges");

		const CHANNEL = await this.channelRepository.findOne({ where: { channelId: channelId }, relations: ['owner'] });
		if (CHANNEL === null || CHANNEL.isRoom === false)
			return new ErrorDTO(true, "Invalid channelId - channel is not found");

		const MEMBER = await this.memberRepository.findOne({ where: { user: { intraName: intraName }, channel: { channelId: channelId } }, relations: ['user', 'channel', 'channel.owner'] });
		if (MEMBER === null)
			return new ErrorDTO(true, "Invalid intraName - user is not a member of this channel");
		if (MEMBER.isBanned !== true)
			CHANNEL.memberCount -= 1;
		await this.channelRepository.save(CHANNEL);
		await this.memberRepository.delete(MEMBER);
		return this.userService.hideData(MEMBER);
	}
}
