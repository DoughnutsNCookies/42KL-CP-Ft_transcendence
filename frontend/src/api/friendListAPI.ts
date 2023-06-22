import api from "./api";
import { FriendData } from "../model/FriendData";

const NAMESPACE = "/friendship";
export type status = "pending" | "accepted" | "rejected" | "blocked" | "muted";

export function getFriendList() {
  return api.get<FriendData[]>(NAMESPACE);
}

export function friendListOf(name: string) {
  return api.get<FriendData[]>(`${NAMESPACE}/` + name);
}

export function friendStatusUpdate(friend: FriendData, status: status) {
  const data: FriendData = {
    ...friend,
    status: status,
  };
  return api.post<FriendData>(NAMESPACE, data);
}
