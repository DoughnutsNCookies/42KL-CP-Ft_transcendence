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
  GameEndDTO,
  GamePauseDTO,
  LobbyStartDTO,
  LobbyEndDTO,
  CountdonwDTO,
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

  private gameRooms = new Map<string, GameRoom>();
  private gameLobbies = new Map<string, Lobby>();

  //Lobby functions
  async handleConnection(client: Socket) {
    const ACCESS_TOKEN = client.handshake.headers.authorization;
    let USER_DATA;
    try{
        USER_DATA =  await this.userService.getMyUserData(ACCESS_TOKEN);
    }
    catch{
      return;
    }
    // Checks if user is already connected, if they are then send error and disconnect
    if (
      this.connected.find((e: Player) => e.intraName === USER_DATA.intraName)
    ) {
      client.emit(
        'gameResponse',
        new GameResponseDTO('error', 'already connected'),
      );
      client.disconnect(true);
      return;
    }

    // Keeps track of users that are connected
    let player = new Player(USER_DATA.intraName, ACCESS_TOKEN, client);
    this.connected.push(player);

    // Clear any ended game rooms
    this.clearGameRooms();

    // If player is ingame, reconnect player to game
    this.gameRooms.forEach(async (gameRoom) =>{
      if (gameRoom._players.includes(USER_DATA.intraName)) {
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
    let USER_DATA;
    try{
      USER_DATA =  await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
   catch{
      return;
    }
    Object.keys(this.queues).forEach((queueType) => {
      if (
        this.queues[queueType].find(
          (e: Player) =>
            e.intraName === USER_DATA.intraName && e.socket.id === client.id,
        )
      ) {
        this.queues[queueType] = this.queues[queueType].filter(function (e) {
          return e.intraName !== USER_DATA.intraName;
        });

        if (LOBBY_LOGGING)
          console.log(
            `${USER_DATA.intraName} left ${queueType} queue due to disconnect.`,
          );
      }
    });

    // If player is in a lobby, leave the lobby
    this.leaveLobby(client);

    // If player is ingame, pause game
    this.gameRooms.forEach((gameRoom) => {
      if (gameRoom._players.includes(USER_DATA.intraName)) {
        gameRoom.togglePause(server, USER_DATA.intraName);
      }
    });

    // Removes user from connection tracking
    this.connected = this.connected.filter(function (e) {
      return e.intraName !== USER_DATA.intraName || e.socket.id !== client.id;
    });
  }

  async joinQueue(client: Socket, clientQueue: string, server: Server) {
    let USER_DATA;
    const ACESS_TOKEN = client.handshake.headers.authorization;
    try{
      USER_DATA =  await this.userService.getMyUserData(ACESS_TOKEN);
    }
    catch{
      return;
    }
    // Check if queue is known
    if (!(clientQueue in this.queues) && clientQueue !== "practice") {
      if (LOBBY_LOGGING)
        console.log(
          `${USER_DATA.intraName} tried to join unknown queue "${clientQueue}".`,
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
      if (gameRoom._players.includes(USER_DATA.intraName)) {
        if (LOBBY_LOGGING)
          console.log(`${USER_DATA.intraName} is already in a game.`);
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
        (e) => e.intraName === USER_DATA.intraName,
      );
    });
    if (IN_QUEUE !== undefined) {
      if (LOBBY_LOGGING)
        console.log(`${USER_DATA.intraName} is already in ${IN_QUEUE} queue.`);
      client.emit(
        'gameResponse',
        new GameResponseDTO('error', 'Already in queue'),
      );
      return;
    }

    if (clientQueue === "practice") {
      let player = new Player(USER_DATA.intraName, ACESS_TOKEN, client);
      this.joinPracticeLobby(player);
      return;
    }

    // Puts player in the queue
    if (LOBBY_LOGGING)
      console.log(`${USER_DATA.intraName} joins ${clientQueue} queue.`);
    let player = new Player(USER_DATA.intraName, ACESS_TOKEN, client);
    client.emit(
      'gameResponse',
      new GameResponseDTO('success', `Joined ${clientQueue} queue`),
    );

    // Run queue logic
    for (let i = 0; i < this.queues[clientQueue].length; i++) {
      const OTHER_USER_DATA = await this.userService.getUserDataByIntraName(player.accessToken, this.queues[clientQueue][i].intraName);
      console.log(OTHER_USER_DATA.intraName, OTHER_USER_DATA.elo);
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

    //TESTING
    // this.joinLobby(player, player, clientQueue);
  }

  async leaveQueue(client: Socket) {
    let USER_DATA;
    try{
      USER_DATA =  await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }
    Object.keys(this.queues).forEach((queueType) => {
      if (
        this.queues[queueType].find((e) => e.intraName === USER_DATA.intraName)
      ) {
        this.queues[queueType] = this.queues[queueType].filter(function (e) {
          return e.intraName !== USER_DATA.intraName;
        });
        client.emit(
          'gameResponse',
          new GameResponseDTO('success', `Left the ${queueType} queue`),
        );
        if (LOBBY_LOGGING)
          console.log(`${USER_DATA.intraName} left ${queueType} queue.`);
      }
    });
  }

  joinPracticeLobby(player: Player) {
    let lobby = new Lobby(player, player, "practice");
    this.gameLobbies.set(player.intraName, lobby);
    lobby.player2Ready = true;
    lobby.player2PowerUp = "normal";
    player.socket.emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(player.intraName, "bot", "practice")));
  }

  joinLobby(player1: Player, player2: Player, gameType: string) {
    let lobby = new Lobby(player1, player2, gameType);
    this.gameLobbies.set(player1.intraName + player2.intraName, lobby);
    player1.socket.join(lobby.name);
    player2.socket.join(lobby.name);
    player1.socket.to(lobby.name).emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(player1.intraName, player2.intraName, gameType)));
    player2.socket.to(lobby.name).emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(player1.intraName, player2.intraName, gameType)));
  }

  async joinPrivateLobby(client: Socket, isHost: boolean, opponentIntraName: string){
    const ACCESS_TOKEN = client.handshake.headers.authorization;
    let   USER_DATA;
    try{
      USER_DATA = await this.userService.getMyUserData(ACCESS_TOKEN);
    }
    catch{
      return;
    }
    if (isHost == true){
      let player1 = new Player(USER_DATA.intraName, ACCESS_TOKEN, client);
      let lobby = new Lobby(player1, null, "private");
      this.gameLobbies.set(player1.intraName + opponentIntraName, lobby);
      client.join(lobby.name);
    }
    else{
      const LOBBY_KEY = this.getLobbyKeyFromIntraNames(USER_DATA.intraName);
      const LOBBY = this.gameLobbies.get(LOBBY_KEY);
      if (LOBBY == undefined){
        client.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO("you", "lobby not found")));
        return;
      }
      let player2 = new Player(USER_DATA.intraName, ACCESS_TOKEN, client);
      LOBBY.player2 = player2;
      client.join(LOBBY.name);
    }
    client.emit('gameState', new GameStateDTO('LobbyStart', new LobbyStartDTO(USER_DATA.intraName, opponentIntraName, "private", isHost)));
  }

  getLobbyKeyFromIntraNames(intraName: string): string | undefined {
    for (const KEY of this.gameLobbies.keys()){
      if (KEY.includes(intraName))
        return KEY;
    }
    return undefined;
  }

  async leaveLobby(client: Socket) {
    let USER_DATA;
    try{
      USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }
    const LOBBY_KEY = this.getLobbyKeyFromIntraNames(USER_DATA.intraName);
    if (LOBBY_KEY != undefined) {
      const LOBBY = this.gameLobbies.get(LOBBY_KEY);
      if (LOBBY != undefined) {
        if (LOBBY.player1.intraName === USER_DATA.intraName) {
          LOBBY.player1.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO("you", "leave")));
          LOBBY.player2.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO(LOBBY.player1.intraName, "leave")));
        }
        else if (LOBBY.player2.intraName === USER_DATA.intraName) {
          LOBBY.player1.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO(LOBBY.player2.intraName, "leave")));
          LOBBY.player2.socket.emit('gameState', new GameStateDTO('LobbyEnd', new LobbyEndDTO("you", "leave")));
        }
        LOBBY.player1.socket.leave(LOBBY.name);
        LOBBY.player2.socket.leave(LOBBY.name);
        this.gameLobbies.delete(LOBBY_KEY);
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

  async handleReady(client: Socket, gameType:string, ready: boolean, powerUp: string, server: Server) {
    let USER_DATA;
    try{
      USER_DATA =  await this.userService.getMyUserData(client.handshake.headers.authorization);
    }
    catch{
      return;
    }
    if (this.getPowerUp(powerUp) === null) return;

    this.gameLobbies.forEach((gameLobby, key) => {
      // let gameType;
      if (gameLobby.player1.intraName === USER_DATA.intraName) {
        // gameType = gameLobby.gameType;
        gameLobby.player1Ready = ready;
        gameLobby.player1PowerUp = powerUp;
        if (gameType == "boring" || gameType == "death")
          gameLobby.player1PowerUp = "normal";

        //TESTING
        // gameLobby.player2Ready = ready;
        // gameLobby.player2PowerUp = powerUp;
        
        if (LOBBY_LOGGING)
          console.log(`${USER_DATA.intraName} is ready.`);
      } else {
        // gameType = gameLobby.gameType;
        gameLobby.player2Ready = ready;
        gameLobby.player2PowerUp = powerUp;
        if (gameType == "boring" || gameType == "death")
          gameLobby.player2PowerUp = "normal";
        if (LOBBY_LOGGING)
          console.log(`${USER_DATA.intraName} is ready.`);
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

  async joinPractice(server: Server, player: Player) {
    let room = new PracticeGameRoom(player, PowerUp.SPIN);
    player.socket.join(room.roomID);
    player.socket.emit('gameState', new GameStateDTO('GameStart', new GameStartDTO("Bot", "standard", true, room.roomID)));
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
      await this.joinPractice(server, player1);
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
    const USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
    if (USER_DATA.error !== undefined) return;
    const ROOM = this.gameRooms.get(roomID);
    if (ROOM === undefined) return;
    ROOM.updatePlayerPos(client.id, xValue, yValue);
  }

  async playerMouseUpdate(client: Socket, roomID: string, isMouseDown: boolean) {
    let USER_DATA;
    try {
      USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
    } catch {
      return;
    }
    const ROOM = this.gameRooms.get(roomID);
    if (ROOM === undefined) return;
    ROOM.updatePlayerMouse(client.id, isMouseDown);
  }

  async emote(client: Socket, server: Server, emote: number){
    let USER_DATA;
    try {
      USER_DATA = await this.userService.getMyUserData(client.handshake.headers.authorization);
    } catch {
      return;
    }
    const LOBBY_KEY = this.getLobbyKeyFromIntraNames(USER_DATA.intraName);
    if (LOBBY_KEY !== undefined){
      const LOBBY = this.gameLobbies.get(LOBBY_KEY);
      if (LOBBY != undefined){
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
