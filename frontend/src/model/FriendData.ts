import { UserData } from "./UserData";

export interface FriendData {
  sender: UserData;
  receiver: UserData;
  status: string;
  id: number;
}

export interface FriendRequestType {
  id: number;
  receiverIntraName: string;
  senderIntraName: string;
  status: string;
}

export const FriendTags = {
  accepted: "accepted",
  muted: "muted",
  blocked: "blocked",
  pending: "pending"
}
