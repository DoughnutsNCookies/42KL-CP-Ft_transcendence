import { Socket, io } from "socket.io-client";

const baseURL = import.meta.env.VITE_API_URL as string;

export type Events =
  | "userConnect"
  | "userDisconnect"
  | "changeStatus"
  | "statusRoom"
  | "friendshipRoom"
  | "message"
  | "typing"
  | "read"
  | "startGame"
  | "gameLoop"
  | "playerMove"
  | "playerClick"
  | "gameState"
  | "gameResponse"
  | "joinQueue"
  | "leaveQueue"
  | "ready"
  | "leaveLobby"
  | "emote"
  | "checkCreateInvite"
  | "createInvite"
  | "joinInvite"
  | "removeInvite"
  | "changeGameType";

class SocketApi {
  socket: Socket;
  constructor(namespace?: string) {
    const URI = namespace ? `${baseURL}/${namespace}` : baseURL;
    this.socket = io(URI, {
      extraHeaders: {
        Authorization:
          document.cookie
            .split(";")
            .find((cookie) => cookie.includes("Authorization"))
            ?.split("=")[1] ?? "",
      },
    });
  }

  connect() {
    this.socket.on("connect", () => {
    });
  }

  listen<T>(event: Events, callBack: (data: T) => void) {
    this.socket.on(event, callBack);
  }

  removeListener(event: Events) {
    this.socket.off(event);
  }

  sendMessages<T>(event: Events, data: T) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default SocketApi;
