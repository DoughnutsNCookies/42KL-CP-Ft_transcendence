import api from "./api";
import { AxiosResponse } from "axios";

const NAMESPACE = "/friendship"

export function addFriend(newFriendIntraName: string): Promise<AxiosResponse> {
  return api.post(NAMESPACE, {
    receiverIntraName: newFriendIntraName,
    status: "PENDING",
  });
}

export function acceptFriend(incomingFriendIntraName: string): Promise<AxiosResponse> {
  return api.patch(NAMESPACE, {
    receiverIntraName: incomingFriendIntraName,
    status: "ACCEPTED",
  });
}

export function blockExistingFriend(toBeBlockedIntraName: string): Promise<AxiosResponse> {
  return api.patch(NAMESPACE, {
    receiverIntraName: toBeBlockedIntraName,
    status: "BLOCKED",
  })
}

export function blockStranger(toBeBlockedIntraName: string): Promise<AxiosResponse> {
  return api.post(NAMESPACE, {
    receiverIntraName: toBeBlockedIntraName,
    status: "BLOCKED",
  })
}

export function deleteFriendship(toBeDeletedIntraName: string) {
  return api.delete(`${NAMESPACE}/${toBeDeletedIntraName}`);
}
