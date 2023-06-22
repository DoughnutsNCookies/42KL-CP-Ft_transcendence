import { Socket } from 'socket.io';

export class Player {
  public intraName: string;
  public accessToken: string;
  public socket: Socket;

  constructor(intraName: string, accessToken?: string, socket?: Socket) {
    this.intraName = intraName;
    this.accessToken = accessToken;
    this.socket = socket;
  }
}
