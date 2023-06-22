import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameRoom } from './entity/gameRoom';
import { PowerGameRoom } from './entity/powerGameRoom';
import { GameSetting, GameMode } from './entity/gameSetting';
import { Socket, Server } from 'socket.io';
import { Player } from './entity/player';
import { GameResponseDTO } from 'src/dto/gameResponse.dto';
import {
  GameStateDTO,
  GameStartDTO,
  LobbyStartDTO,
  LobbyEndDTO,
  CountdonwDTO,
  CheckCreateInviteDTO,
  CreateInviteDTO,
  RemoveInviteDTO,
  JoinInviteDTO,
  GameTypeChangeDTO,
} from 'src/dto/gameState.dto';
import { MatchService } from 'src/match/match.service';
import { DeathGameRoom } from './entity/deathGameRoom';
import { Lobby } from './entity/lobby';
import { PracticeGameRoom } from './entity/practiceGameRoom';

export enum PowerUp{
  NORMAL = 0,
  SPEED = 1,
  SIZE = 2,
  PRECISION = 3,
  SPIN = 4,
}

class Invitation{
  host: Player;
  receiver: string;

  constructor(host: Player, receiver: string){
    this.host = host;
    this.receiver = receiver;
  }
}

const LOBBY_LOGGING = false;

@Injectable()
export class GameService {
  constructor(
    private readonly userService: UserService,
    private readonly matchService: MatchService,
  ) {}

  //Lobby variables
  private queues = {
    boring: [],
    standard: [],
    death: [],
  };
  private connected = [];

  //hosts : map intraName -> messageID
  //invitationRoom : map messageID -> Invitation
  private hosts = new Map<string, number>();
  private invitationRoom = new Map<number, Invitation>();
  private gameRooms = new Map<string, GameRoom>();
  private gameLobbies = new Map<string, Lobby>();

  //Lobby functions
  async handleConnection(client: Socket) {
    const ACCESS_TOKEN = client.handshake.headers.authorization;
    let userData: any;
    try {
      userData = await this.userService.getMyUserData(ACCESS_TOKEN);
    } catch {
      return;
    }
    // Checks if user is already connected, if they are then send error and disconnect
    if (
      this.connected.find((e: Player) => e.intraName === userData.intraName)
    ) {
      client.emit(
        'gameResponse',
        new GameResponseDTO('error', 'already connected'),
      );
      client.disconnect(true);
      return;
    }

    // Keeps track of users that are connected
    let player = new Player(userData.intraName, ACCESS_TOKEN, client);
    this.connected.push(player);

    // Clear any ended game rooms
    this.clearGameRooms();

    // If player is ingame, reconnect player to game
    this.gameRooms.forEach(async (gameRoom) =>{
      if (gameRoom._players.includes(userData.intraName)) {
        let opponentIntraName = '';
        if (player.intraName == gameRoom.player1.intraName){
          gameRoom.player1 = player;
          opponentIntraName = gameRoom.player2.intraName;
        } else if (player.intraName == gameRoom.player2.intraName){
          gameRoom.player2 = player;
          opponentIntraName = gameRoom.player1.intraName;
        }
        player.socket.join(gameRoom.roomID);
        player.socket.emit(
          'gameState',
          new GameStateDTO(
            'GameStart',
            new GameStartDTO(
              opponentIntraName,
              gameRoom.gameType,
              player === gameRoom.player1,
              gameRoom.roomID,
              gameRoom.leftPaddle.powerUp,
              gameRoom.rightPaddle.powerUp,
            ),
          ),
        );
        await this.countdown(3);
        gameRoom.resumeGame(player);
      }
    });
  }

  async handleDisconnect(server: Server, client: Socket) {
    let userData: any;
    try {
      userData = await this.userService.getMyUserData(client.handshake.headers.authorization);
    } catch {
      return;
    }

    Object.keys(this.queues).forEach((queueType) => {
      if (
        this.queues[queueType].find(
          (e: Player) =>
            e.intraName === userData.intraName && e.socket.id === client.id,
        )
      ) {
        this.queues[queueType] = this.queues[queueType].filter(function (e) {
          return e.intraName !== userData.intraName;
        });

        if (LOBBY_LOGGING)
          console.log(
            `${userData.intraName} left ${queueType} queue due to disconnect.`,
          );
      }
    });

    // If player is hosting, cancel invite
    this.cancelInvite(client);

    // If player is in a lobby, leave the lobby
    this.leaveLobby(client);

    // If player is ingame, pause game
    this.gameRooms.forEach((gameRoom) => {
      if (gameRoom._players.includes(userData.intraName)) {
        gameRoom.togglePause(server, userData.intraName);
      }
    });

    // Removes user from connection tracking
    this.connected = this.connected.filter(function (e) {
      return e.intraName !== userData.intraName || e.socket.id !== client.id;
    });
  }

  async joinQueue(client: Socket, clientQueue: string, server: Server) {
    let userData: any;
    const ACESS_TOKEN = client.handshake.headers.authorization;
    try{
      userData =  await this.userService.getMyUserData(ACESS_TOKEN);
    }
    catch{
      return;
    }
    // Check player is currently sending invite
    const INVITE = this.hosts.get(userData.intraName);
    if (INVITE !== undefined) {
      client.emit(
        'gameResponse',
        new GameResponseDTO('error', 'Already sending invite'),
      );
      return;
    }
    // Check if queue is known
    if (!(clientQueue in this.queues) && clientQueue !== "practice") {
      if (LOBBY_LOGGING)
        console.log(
          `${userData.intraName} tried to join unknown queue "${clientQueue}".`,
        );
      client.emit(
        'gameResponse',
        new GameResponseDTO('error', 'Unknown queue: ' + clientQueue),
      );
      return;
    }

    // Clear any ended game rooms
    this.clearGameRooms();

    // Check if player is already in a game
    this.gameRooms.forEach((gameRoom) => {
      if (gameRoom._players.includes(userData.intraName)) {
        if (LOBBY_LOGGING)
          console.log(`${userData.intraName} is already in a game.`);
        client.emit(
          'gameResponse',
          new GameResponseDTO('error', 'Already in game'),
        );
        return;
      }
    });

    // Check if player if already in a queue
    const IN_QUEUE = Object.keys(this.queues).find((queueType) => {
      return this.queues[queueType].find(
        (e) => e.intraName === userData.intraName,
      );
    });
    if (IN_QUEUE !== undefined) {
      if (LOBBY_LOGGING)
        console.log(`${userData.intraName} is already in ${IN_QUEUE} queue.`);
      client.emit(
        'gameResponse',
        new GameResponseDTO('error', 'Already in queue'),
      );
      return;
    }

    if (clientQueue === "practice") {
      let player = new Player(userData.intraName, ACESS_TOKEN, client);
      this.joinPracticeLobby(player);
      return;
    }

    // Puts player in the queue
    if (LOBBY_LOGGING)
      console.log(`${userData.intraName} joins ${clientQueue} queue.`);
    let player = new Player(userData.intraName, ACESS_TOKEN, client);
    client.emit(
      'gameResponse',
      new GameResponseDTO('success', `Joined ${clientQueue} queue`),
    );

    // Run queue logic
    for (let i = 0; i < this.queues[clientQueue].length; i++) {
      const OTHER_USER_DATA = await this.userService.getUserDataByIntraName(player.accessToken, this.queues[clientQueue][i].intraName);
      if (OTHER_USER_DATA.error !== undefined)
        continue;

      let otherPlayer = this.queues[clientQueue][i];
      this.queues[clientQueue].splice(i, 1);
      if (LOBBY_LOGGING)
        console.log(`Game start ${otherPlayer.intraName} ${player.intraName}`);
      this.joinLobby(otherPlayer, player, clientQueue);
      return;
    }
    this.queues[clientQueue].push(player);
  }

  async leaveQueue(client: Socket) {
    let userData: any;
    try{
      userData =  await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }
    Object.keys(this.queues).forEach((queueType) => {
      if (
        this.queues[queueType].find((e) => e.intraName === userData.intraName)
      ) {
        this.queues[queueType] = this.queues[queueType].filter(function (e) {
          return e.intraName !== userData.intraName;
        });
        client.emit(
          'gameResponse',
          new GameResponseDTO('success', `Left the ${queueType} queue`),
        );
        if (LOBBY_LOGGING)
          console.log(`${userData.intraName} left ${queueType} queue.`);
      }
    });
  }

  joinPracticeLobby(player: Player) {
    let lobby = new Lobby(player, player, "practice");
    this.gameLobbies.set(player.intraName, lobby);
    lobby.player2Ready = true;
    lobby.player2PowerUp = "normal";
    player.socket.emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(player.intraName, "BOT", "practice")));
  }

  joinLobby(player1: Player, player2: Player, gameType: string) {
    let lobby = new Lobby(player1, player2, gameType);
    this.gameLobbies.set(player1.intraName + player2.intraName, lobby);
    player1.socket.join(lobby.name);
    player2.socket.join(lobby.name);
    player1.socket.to(lobby.name).emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(player1.intraName, player2.intraName, gameType)));
    player2.socket.to(lobby.name).emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(player1.intraName, player2.intraName, gameType)));
  }

  async checkCreateInvite(client: Socket){
    let user_data;
    const ACCESS_TOKEN = client.handshake.headers.authorization;
    try{
      user_data = await this.userService.getMyUserData(ACCESS_TOKEN);
    }
    catch{
      return;
    }
    const CURRENT_INVITE = this.hosts.get(user_data.intraName);
    //Have an ongoing invite
    if (CURRENT_INVITE !== undefined){
      client.emit('gameState', new GameStateDTO('CheckCreateInvite', new CheckCreateInviteDTO("error")));
      return;
    }
    //Is queueing
    const IN_QUEUE = Object.keys(this.queues).find((queueType) => {
      return this.queues[queueType].find(
        (e) => e.intraName === user_data.intraName,
      );
    });
    if (IN_QUEUE !== undefined) {
      client.emit('gameState', new GameStateDTO('CheckCreateInvite', new CheckCreateInviteDTO("error")));
      return;
    }

    client.emit('gameState', new GameStateDTO('CheckCreateInvite', new CheckCreateInviteDTO("success")));
  }

  async createInvite(client: Socket, sender: string, receiver: string, messageID: number){
    let user_data;
    const ACCESS_TOKEN = client.handshake.headers.authorization;
    try{
      user_data = await this.userService.getMyUserData(ACCESS_TOKEN);
    }
    catch{
      return;
    }
    const HOST = new Player(user_data.intraName, ACCESS_TOKEN, client);
    const INVITATION = new Invitation(HOST, receiver);
    this.hosts.set(HOST.intraName, messageID);
    this.invitationRoom.set(messageID, INVITATION);
    client.emit('gameState', new GameStateDTO('CreateInvite', new CreateInviteDTO(messageID)));
  }

  async joinInvite(client: Socket, messageID: number){
    let user_data;
    const ACCESS_TOKEN = client.handshake.headers.authorization;
    try{
      user_data = await this.userService.getMyUserData(ACCESS_TOKEN);
    }
    catch{
      return;
    }
    const INVITATION = this.invitationRoom.get(messageID);

    //Client is currently queueing
    const IN_QUEUE = Object.keys(this.queues).find((queueType) => {
      return this.queues[queueType].find(
        (e) => e.intraName === user_data.intraName,
      );
    });
    if (IN_QUEUE !== undefined) {
      client.emit('gameState', new GameStateDTO('JoinInvite', new JoinInviteDTO("error", -1)));
      return;
    }
    //Invitation not found
    if (INVITATION === undefined){
      client.emit('gameState', new GameStateDTO('JoinInvite', new JoinInviteDTO("error", -1)));
      return;
    }
    //The client is the host of the invite, so cannot join
    if (INVITATION.host.intraName == user_data.intraName){
      client.emit('gameState', new GameStateDTO('JoinInvite', new JoinInviteDTO("error", -1)));
      return;
    }
    else{
      client.emit('gameState', new GameStateDTO('JoinInvite', new JoinInviteDTO("success", messageID)));
      INVITATION.host.socket.emit('gameState', new GameStateDTO('RemoveInvite', new RemoveInviteDTO("success",messageID)));
      this.hosts.delete(INVITATION.host.intraName);
      this.invitationRoom.delete(messageID);

      //Make both players join lobby
      let lobby = new Lobby(INVITATION.host, new Player(user_data.intraName, ACCESS_TOKEN, client), "");
      this.gameLobbies.set(INVITATION.host.intraName + user_data.intraName, lobby);
      INVITATION.host.socket.join(lobby.name);
      client.join(lobby.name);
      INVITATION.host.socket.to(lobby.name).emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(INVITATION.host.intraName, user_data.intraName, "", true)));
      client.to(lobby.name).emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(INVITATION.host.intraName, user_data.intraName, "", true)));
    } 
  }

  async cancelInvite(client: Socket){
    let user_data;
    try{
      user_data = await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }
    const MESSAGE_ID = this.hosts.get(user_data.intraName);
    if (MESSAGE_ID !== undefined){
      client.emit('gameState', new GameStateDTO('RemoveInvite', new RemoveInviteDTO("success",MESSAGE_ID)));
      this.invitationRoom.delete(MESSAGE_ID);
      this.hosts.delete(user_data.intraName);
    }
    else{
      client.emit('gameState', new GameStateDTO('RemoveInvite', new RemoveInviteDTO("error",-1)));
    }
  }

  getLobbyKeyFromIntraNames(intraName: string): string | undefined {
    for (const KEY of this.gameLobbies.keys()){
      if (KEY.includes(intraName))
        return KEY;
    }
    return undefined;
  }

  async leaveLobby(client: Socket) {
    let user_data;
    try{
      user_data = await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }

    const LOBBY_KEY = this.getLobbyKeyFromIntraNames(user_data.intraName);
    if (LOBBY_KEY != undefined) {
      const LOBBY = this.gameLobbies.get(LOBBY_KEY);
      if (LOBBY != undefined) {
        if (LOBBY.player1.intraName === user_data.intraName) {
          LOBBY.player1.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO("you", "leave")));
          LOBBY.player2.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO(LOBBY.player1.intraName, "leave")));
        }
        else if (LOBBY.player2.intraName === user_data.intraName) {
          LOBBY.player1.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO(LOBBY.player2.intraName, "leave")));
          LOBBY.player2.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO("you", "leave")));
        }
        LOBBY.player1.socket.leave(LOBBY.name);
        LOBBY.player2.socket.leave(LOBBY.name);
        this.gameLobbies.delete(LOBBY_KEY);
      }
    }
  }

  async changeGameType(client: Socket, gameType: string, server: Server) {
    let user_data;
    try{
      user_data = await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }
    const LOBBY_KEY = this.getLobbyKeyFromIntraNames(user_data.intraName);
    if (LOBBY_KEY != undefined) {
      const LOBBY = this.gameLobbies.get(LOBBY_KEY);
      if (LOBBY != undefined) {
        if (LOBBY.host === user_data.intraName) {
          LOBBY.gameType = gameType;
          server.to(LOBBY.name).emit('gameState', new GameStateDTO('GameTypeChange', new GameTypeChangeDTO(gameType)));
        }
      }
    }
  }

  getPowerUp(powerUpString: string): PowerUp {
    let powerUp: PowerUp;
    powerUpString = powerUpString.toLowerCase();
    if (powerUpString === "normal")
      powerUp = PowerUp.NORMAL;
    else if (powerUpString === "speed" || powerUpString === "vzzzzzzt")
      powerUp = PowerUp.SPEED;
    else if (powerUpString === "precision" || powerUpString === "piiuuuuu")
      powerUp = PowerUp.PRECISION;
    else if (powerUpString === "size" || powerUpString === "ngeeeaat")
      powerUp = PowerUp.SIZE;
    else if (powerUpString === "spin" || powerUpString === "vrooooom")
      powerUp = PowerUp.SPIN;
    else
      powerUp = null;
    return powerUp;
  }

  async handleReady(client: Socket, gameType: string, ready: boolean, powerUp: string, server: Server) {
    let user_data;
    try{
      user_data =  await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }
    if (this.getPowerUp(powerUp) === null) return;
    this.gameLobbies.forEach((gameLobby, key) => {
      if (gameLobby.player1.intraName === user_data.intraName) {
        gameLobby.player1Ready = ready;
        gameLobby.player1PowerUp = powerUp;
        if (gameType == "boring" || gameType == "death")
          gameLobby.player1PowerUp = "normal";
        
        if (LOBBY_LOGGING)
          console.log(`${user_data.intraName} is ready.`);
      } else {
        gameLobby.player2Ready = ready;
        gameLobby.player2PowerUp = powerUp;
        if (gameType == "boring" || gameType == "death")
          gameLobby.player2PowerUp = "normal";
        if (LOBBY_LOGGING)
          console.log(`${user_data.intraName} is ready.`);
      }
      if (gameLobby.player1Ready == true && gameLobby.player2Ready == true)
      {
        this.gameLobbies.delete(key);
        gameLobby.player1.socket.leave(gameLobby.name);
        gameLobby.player2.socket.leave(gameLobby.name);
        this.joinGame(gameLobby.player1, gameLobby.player2, gameType, server, this.getPowerUp(gameLobby.player1PowerUp), this.getPowerUp(gameLobby.player2PowerUp));
      }
    });
  }

  async joinPractice(server: Server, player: Player, powerUp: PowerUp) {
    let room = new PracticeGameRoom(player, powerUp);
    player.socket.join(room.roomID);
    player.socket.emit('gameState', new GameStateDTO('GameStart', new GameStartDTO("BOT", "standard", true, room.roomID, powerUp)));
    this.gameRooms.set(room.roomID, room);
    await room.run(server);
  }

  async joinGame(player1: Player, player2: Player, gameType: string, server: Server, player1PowerUp?: PowerUp, player2PowerUp?: PowerUp): Promise<string> {
    let room;
    if (gameType === 'boring') {
      const ROOM_SETTING = new GameSetting(100, 100, GameMode.BORING);
      room = new GameRoom(player1, player2, gameType, ROOM_SETTING, this.matchService, this.userService);
    } else if (gameType === 'standard') {
      const ROOM_SETTING = new GameSetting(100, 100, GameMode.STANDARD);
      room = new PowerGameRoom(
        player1,
        player2,
        gameType,
        ROOM_SETTING,
        player1PowerUp,
        player2PowerUp,
        this.matchService,
        this.userService,
      );
    } else if (gameType === 'practice') {
      await this.joinPractice(server, player1, player1PowerUp);
      return;
    }
    else if (gameType === 'death'){
      const ROOM_SETTING = new GameSetting(100, 100, GameMode.DEATH, 1);
      room = new DeathGameRoom(player1, player2, gameType, ROOM_SETTING, this.matchService, this.userService);
    }
    player1.socket.join(room.roomID);
    player2.socket.join(room.roomID);
    player1.socket.emit('gameState', new GameStateDTO('LobbyCountdown', new CountdonwDTO(3)));
    player2.socket.emit('gameState', new GameStateDTO('LobbyCountdown', new CountdonwDTO(3)));
    await this.countdown(3);
    player1.socket.emit('gameState', new GameStateDTO('GameStart', new GameStartDTO(player2.intraName, gameType, true, room.roomID, player1PowerUp, player2PowerUp)));
    player2.socket.emit('gameState', new GameStateDTO('GameStart', new GameStartDTO(player1.intraName, gameType, false, room.roomID, player1PowerUp, player2PowerUp)));
    this.gameRooms.set(room.roomID, room);
    player1.socket.emit('gameState', new GameStateDTO('GameCountdown', new CountdonwDTO(3)));
    player2.socket.emit('gameState', new GameStateDTO('GameCountdown', new CountdonwDTO(3)));
    await this.countdown(3);
    await room.run(server);
    return room.roomID;
  }

  async playerUpdate(client: Socket, roomID: string, xValue: number, yValue: number) {
    let userData: any;
    try {
      userData = await this.userService.getMyUserData(client.handshake.headers.authorization);
    } catch {
      return;
    }
    const ROOM = this.gameRooms.get(roomID);
    if (ROOM === undefined) return;
    ROOM.updatePlayerPos(client.id, xValue, yValue);
  }

  async playerMouseUpdate(client: Socket, roomID: string, isMouseDown: boolean) {
    let userData;
    try {
      userData = await this.userService.getMyUserData(client.handshake.headers.authorization);
    } catch {
      return;
    }
    const ROOM = this.gameRooms.get(roomID);
    if (ROOM === undefined) return;
    ROOM.updatePlayerMouse(client.id, isMouseDown);
  }

  async emote(client: Socket, server: Server, emote: number){
    let userData;
    try {
      userData = await this.userService.getMyUserData(client.handshake.headers.authorization);
    } catch {
      return;
    }
    const LOBBY_KEY = this.getLobbyKeyFromIntraNames(userData.intraName);
    if (LOBBY_KEY !== undefined){
      const LOBBY = this.gameLobbies.get(LOBBY_KEY);
      if (LOBBY != undefined) {
        server.to(LOBBY.name).emit("emote", emote);
      }
    }
  }

  clearGameRooms() {
    this.gameRooms.forEach((gameRoom, key) => {
      if (gameRoom.gameEnded) {
        this.gameRooms.delete(key);
        if (LOBBY_LOGGING) console.log(`game room ${key} has been deleted.`);
      }
    });
  }

  async countdown(seconds: number): Promise<void> {
    let counter = seconds;
    while (counter > 0) {
      counter--;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
