import { UserData } from "./UserData";

Date.prototype.toJSON = function () {
  return this.getTime().toString();
};

export interface ChatroomData {
  channelId: number;
  channelName: string;
  isPrivate: boolean;
  isRoom: boolean;
  owner: UserData | null;
  password: string | null;
  newMessage: boolean;
  memberCount: number;
}

export interface ChannelData {
  owner: UserData,
  channelName: string,
  isPrivate: boolean,
	password: null | string,
	isRoom: boolean,
	channelId: number
}

export interface CreateChannelData {
  channelName: string,
  isPrivate: boolean,
  password: string | null,
}

export interface UpdateChannelData {
  channelId: number,
  channelName: string,
  isPrivate: boolean,
  oldPassword: string | null,
  newPassword: string | null,
}

export interface InviteMemberData {
  channelId: number,
  intraName: string,
  isAdmin: boolean,
  isBanned: boolean,
  isMuted: boolean,
  password: string | null,
}

export interface UpdateMemberData {
  channelId: number,
  intraName: string,
  isAdmin: boolean,
  isBanned: boolean,
  isMuted: boolean,
}

export interface ChatroomMessageData {
  senderChannel: ChannelData;
  receiverChannel: ChannelData;
  isRoom: boolean;
  message: string;
  messageId: number;
  timeStamp: string;
}

export interface NewMessageData {
  messageId: number;
  intraName: string;
  message: string;
}

export interface MemberData {
  user: UserData,
  channel: ChannelData,
  isAdmin: boolean,
  isBanned: boolean,
  isMuted: boolean,
  lastRead: string,
  memberId: number
}
