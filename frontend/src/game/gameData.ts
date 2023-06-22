import SocketApi from "../api/socketApi";
import { GameDTO } from "../model/GameDTO";
import { GameResponseDTO } from "../model/GameResponseDTO";
import {
  GameStateDTO,
  GameStartDTO,
  GameEndDTO,
  GamePauseDTO,
  FieldEffectDTO,
  LobbyStartDTO,
  LobbyEndDTO,
  CountdonwDTO,
  CreateInviteDTO,
  JoinInviteDTO,
  GameTypeChangeDTO,
  CheckCreateInviteDTO,
  RemoveInviteDTO,
} from "../model/GameStateDTO";
import { Offset } from "../model/GameModels";
import { clamp, update } from "lodash";
import GameEntity, {
  GameBlackhole,
  GameBlock,
  GameTimeZone,
} from "../model/GameEntities";
import sleep from "../functions/sleep";
import GameParticle from "../model/GameParticle";
import * as PIXI from "pixi.js";
import Paddle from "./game_objects/Paddle";
import {
  playGameSound,
  HitType,
  playBlackHoleSound,
  stopBlackHoleSound,
  playEngGameSound,
  stopEngGameSound,
} from "../functions/audio";

export enum PaddleType {
  "Vzzzzzzt",
  "Piiuuuuu",
  "Ngeeeaat",
  "Vrooooom",
  "boring",
}

export type GameType =
  | "boring"
  | "standard"
  | "death"
  | "practice"
  | "private"
  | "";

interface GameSettings {
  particlesFilter: boolean;
  entitiesFilter: boolean;
  paddleFilter: boolean;
  hitFilter: boolean;
  tickPerParticles: number;
  gameMaxWidth: number;
  gameMaxHeight: number;
}

export class GameData {
  socketApi: SocketApi;

  // game display settings
  particlesFilter: boolean;
  entitiesFilter: boolean;
  paddleFilter: boolean;
  hitFilter: boolean;
  tickPerParticles: number;
  gameMaxWidth: number;
  gameMaxHeight: number;
  gameCurrentWidth: number;
  gameCurrentHeight: number;

  // pong variables
  private _pongPosition: Offset = { x: 800, y: 450 };
  private _pongSpeed: Offset = { x: 12, y: 8 };
  pongSpin: number = 0;
  attracted: boolean = false;
  pongSpeedMagnitude: number = 0;
  numberHits: number = 0;

  // player related variables
  mousePosition: Offset = { x: 0, y: 0 };
  leftPaddleSucking: boolean = false;
  rightPaddleSucking: boolean = false;
  leftPaddlePosition: Offset = { x: 30, y: 450 };
  rightPaddlePosition: Offset = { x: 1570, y: 450 };
  leftPaddleType: PaddleType = PaddleType.boring;
  rightPaddleType: PaddleType = PaddleType.boring;
  player1IntraId: string = "";
  player2IntraId: string = "";
  isLeft: boolean = false;
  isRight: boolean = false;
  player1Score: number = 0;
  player2Score: number = 0;

  // game state related variables
  usingLocalTick: boolean = false;
  localTicker: PIXI.Ticker | undefined = undefined;
  localTickerPongSpeed: Offset = { x: 0, y: 0 };
  gameDisplayed: boolean = false;
  gameStarted: boolean = false;
  gameRoom: string = "";
  gameType: GameType = "";
  isPrivate: boolean = false;
  gameEntities: GameEntity[] = [];
  inFocus: boolean = true;

  // game invite related variables
  activeInviteMessageId: number = -1;

  // global effects
  globalSpeedFactor: number = 1;
  globalScaleFactor: number = 1;
  globalGravityX: number = 0;
  globalGravityY: number = 0;

  blockPosition: Offset = { x: -500, y: -500 };

  setScale?: (scale: number) => void;
  setUsingTicker?: (usingTicker: boolean) => void;
  displayLobby?: () => void;
  stopDisplayLobby?: () => void;
  setShouldRender?: (shouldRender: boolean) => void;
  setShouldDisplayGame?: (shouldDisplayGame: boolean) => void;
  setEntities?: (entities: GameEntity[]) => void;
  setCanCreateInvite?: (canCreateInvite: boolean) => void;
  setInviteCreated?: (inviteCreated: boolean) => void;
  setJoinSuccessful?: (joinSuccessfull: boolean) => void;
  setActiveInviteId?: (activeInviteId: number) => void;
  setUnableToCreateInvite?: (unableToCreateInvite: boolean) => void;
  setUnableToAcceptInvite?: (unableToAcceptInvite: boolean) => void;
  private sendPlayerMove?: (y: number, x: number, gameRoom: string) => void;
  private sendPlayerClick?: (isMouseDown: boolean, gameRoom: string) => void;
  ballHit?: (
    pongSpeedMagnitude: number,
    hitPosition: Offset,
    pongSpeed: Offset,
    strength: number,
    tickerSpeed: number
  ) => void;
  ballHitParticle?: () => void;
  paddleHitParticle?: () => void;
  lobbyCountdown?: () => void;
  stopDisplayQueue?: () => void;
  setGameType?: (gameType: GameType) => void;
  changeStatus?: (status: string) => void;
  zoomSlowMo?: (position: Offset) => void;

  resize?: () => void;
  focus?: () => void;
  blur?: () => void;

  constructor() {
    this.particlesFilter = true;
    this.entitiesFilter = true;
    this.paddleFilter = true;
    this.hitFilter = true;
    this.tickPerParticles = 0;
    this.gameMaxWidth = 1600;
    this.gameMaxHeight = 900;
    this.gameCurrentWidth = 1600;
    this.gameCurrentHeight = 900;
    this.loadSettings();
    this.socketApi = new SocketApi("game");
    this.socketApi.listen("gameLoop", this.listenToGameLoopCallBack.bind(this));
    this.socketApi.listen("gameState", this.listenToGameState);
    this.socketApi.listen("gameResponse", this.listenToGameResponse);
    this.sendPlayerMove = (y: number, x: number, gameRoom: string) => {
      this.socketApi.sendMessages("playerMove", {
        gameRoom: gameRoom,
        y: y.toFixed(0),
        x: x.toFixed(0),
      });
    };
    this.sendPlayerClick = (isMouseDown: boolean, gameRoom: string) => {
      this.socketApi.sendMessages("playerClick", {
        gameRoom: gameRoom,
        isMouseDown: isMouseDown,
      });
    };
  }

  private loadSettings() {
    const gameSettings = localStorage.getItem("gameSettings");
    if (gameSettings) {
      const settings: GameSettings = JSON.parse(gameSettings);
      this.particlesFilter = settings.particlesFilter ?? true;
      this.entitiesFilter = settings.entitiesFilter ?? true;
      this.paddleFilter = settings.paddleFilter ?? true;
      this.hitFilter = settings.hitFilter ?? true;
      this.tickPerParticles = settings.tickPerParticles ?? 0;
      this.gameMaxWidth = settings.gameMaxWidth ?? 1600;
      this.gameMaxHeight = settings.gameMaxHeight ?? 900;
    }
  }
  get getSettings() {
    const settings: GameSettings = {
      particlesFilter: this.particlesFilter,
      entitiesFilter: this.entitiesFilter,
      paddleFilter: this.paddleFilter,
      hitFilter: this.hitFilter,
      tickPerParticles: this.tickPerParticles,
      gameMaxWidth: this.gameMaxWidth,
      gameMaxHeight: this.gameMaxHeight,
    };
    return settings;
  }

  set setUseParticlesFilter(particlesFilter: boolean) {
    this.particlesFilter = particlesFilter;
    this.saveSettings();
  }

  private saveSettings() {
    const settings: GameSettings = {
      particlesFilter: this.particlesFilter,
      entitiesFilter: this.entitiesFilter,
      paddleFilter: this.paddleFilter,
      hitFilter: this.hitFilter,
      tickPerParticles: this.tickPerParticles,
      gameMaxWidth: this.gameMaxWidth,
      gameMaxHeight: this.gameMaxHeight,
    };
    localStorage.setItem("gameSettings", JSON.stringify(settings));
  }

  set setUseEntitiesFilter(entitiesFilter: boolean) {
    this.entitiesFilter = entitiesFilter;
    this.saveSettings();
  }

  set setUsePaddleFilter(paddleFilter: boolean) {
    this.paddleFilter = paddleFilter;
    this.saveSettings();
  }

  set setUseHitFilter(hitFilter: boolean) {
    this.hitFilter = hitFilter;
    this.saveSettings();
  }

  set setTickPerParticlesSpawn(tickPerParticles: number) {
    this.tickPerParticles = tickPerParticles;
    this.saveSettings();
  }

  set setGameMaxWidth(gameMaxWidth: number) {
    this.gameMaxWidth = gameMaxWidth;
    this.gameMaxHeight = Math.floor((gameMaxWidth / 16) * 9);
    this.saveSettings();
  }

  set setGameMaxHeight(gameMaxHeight: number) {
    this.gameMaxHeight = gameMaxHeight;
    this.gameMaxWidth = Math.floor((gameMaxHeight / 9) * 16);
    this.saveSettings();
  }

  get pongPosition() {
    return { ...this._pongPosition } as Readonly<Offset>;
  }

  get pongSpeed() {
    return { ...this._pongSpeed } as Readonly<Offset>;
  }

  async joinQueue(queueType: string): Promise<GameResponseDTO> {
    this.socketApi.sendMessages("joinQueue", { queue: queueType });
    return new Promise((resolve) => {
      this.socketApi.socket.on("gameResponse", (event) => {
        resolve(event);
      });
    });
  }

  async leaveQueue(): Promise<GameResponseDTO> {
    this.socketApi.sendMessages("leaveQueue", {});
    return new Promise((resolve) => {
      this.socketApi.socket.on("gameResponse", (event) => {
        resolve(event);
      });
    });
  }

  sendReady(ready: boolean, powerUp: string) {
    this.socketApi.sendMessages("ready", {
      ready: ready,
      powerUp: powerUp,
      gameType: this.gameType,
    });
  }

  sendUpdateGameType(gameType: string) {}

  checkCreateInvite() {
    this.socketApi.sendMessages("checkCreateInvite", {});
  }

  createInvite(sender: string, receiver: string, messageId: number) {
    this.socketApi.sendMessages("createInvite", {
      messageId: messageId,
      sender: sender,
      receiver: receiver,
    });
  }

  joinInvite(messageId: number) {
    this.socketApi.sendMessages("joinInvite", { messageId: messageId });
  }

  removeInvite(messageId: number) {
    this.socketApi.sendMessages("removeInvite", { messageId: messageId });
  }

  leaveLobby() {
    this.socketApi.sendMessages("leaveLobby", {});
  }

  updateInviteId(messageId: number) {
    if (this.setActiveInviteId) {
      this.setActiveInviteId(messageId);
    }
  }

  async startGame() {
    if (this.gameStarted) {
      console.error("game already started");
      return;
    }
    while (
      !this.stopDisplayQueue ||
      !this.changeStatus ||
      !this.setShouldRender ||
      !this.setUsingTicker
    ) {
      await sleep(10);
    }
    if (this.stopDisplayQueue) this.stopDisplayQueue();
    if (this.changeStatus) this.changeStatus("INGAME");
    this.gameStarted = true;
    if (this.setShouldRender) this.setShouldRender(true);
    if (this.setUsingTicker) this.setUsingTicker(true);
  }

  displayGame() {
    if (this.gameDisplayed) {
      console.error("game already displayed");
      return;
    }
    const canvas = document.getElementById("pixi") as HTMLCanvasElement;
    canvas.style.display = "block";
    this.resize = () => {
      const aspectRatio = 16 / 9;
      const clampedWidth = clamp(window.innerWidth, 0, this.gameMaxWidth);
      const clampedHeight = clamp(window.innerHeight, 0, this.gameMaxHeight);
      const newWidth = Math.min(clampedWidth, clampedHeight * aspectRatio);
      const newHeight = Math.min(clampedHeight, clampedWidth / aspectRatio);
      const newTop = (window.innerHeight - newHeight) / 2;
      const newLeft = (window.innerWidth - newWidth) / 2;
      this.gameCurrentWidth = newWidth;
      this.gameCurrentHeight = newHeight;
      document.documentElement.style.setProperty("--canvas-top", `${newTop}px`);
      document.documentElement.style.setProperty(
        "--canvas-left",
        `${newLeft}px`
      );
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.width = newWidth + "px";
      canvas.style.height = newHeight + "px";
      if (this.setScale) this.setScale(newWidth / 1600);
    };
    this.focus = async () => {
      this.inFocus = true;
      // this.setUsingTicker?.(true);
      for (let i = 0; i < 20; i++) {
        if (!this.inFocus) return;
        this.globalSpeedFactor += 0.05;
        this.globalScaleFactor += 0.02;
        await sleep(50);
      }
      this.globalSpeedFactor = 1;
      this.globalScaleFactor = 1;
    };
    this.blur = async () => {
      this.inFocus = false;
      for (let i = 0; i < 20; i++) {
        if (this.inFocus) return;
        this.globalSpeedFactor -= 0.05;
        this.globalScaleFactor -= 0.02;
        await sleep(50);
      }
      // this.setUsingTicker?.(false);
    };
    window.addEventListener("resize", this.resize);
    window.addEventListener("focus", this.focus);
    window.addEventListener("blur", this.blur);
    this.resize();
    this.gameDisplayed = true;
    if (this.setShouldDisplayGame) this.setShouldDisplayGame?.(true);
  }

  stopDisplayGame() {
    if (!this.gameDisplayed) {
      console.error("game already stopped displaying");
      return;
    }
    const canvas = document.getElementById("pixi") as HTMLCanvasElement;
    canvas.style.display = "none";
    window.removeEventListener("resize", this.resize!);
    window.removeEventListener("focus", this.focus!);
    window.removeEventListener("blur", this.blur!);
    this.gameDisplayed = false;
  }

  async endGame() {
    if (!this.gameStarted) return;
    this.stopDisplayLobby!();
    await sleep(7000);
    this.changeStatus!("ONLINE");
    this.stopDisplayGame();
    this.gameStarted = false;
    this.isLeft = false;
    this.isRight = false;
    if (this.setShouldRender) this.setShouldRender(false);
    if (this.setUsingTicker) this.setUsingTicker(false);
    this._resetVariables();
    if (this.setShouldDisplayGame) this.setShouldDisplayGame?.(false);
  }

  private _resetVariables() {
    this.gameType = "";
    this.leftPaddlePosition = { x: 30, y: 450 };
    this.rightPaddlePosition = { x: 1570, y: 450 };
    this.leftPaddleType = PaddleType.boring;
    this.rightPaddleType = PaddleType.boring;
    this._pongPosition = { x: 800, y: 450 };

    this.globalGravityX = 0;
    this.globalGravityY = 0;
    this.globalSpeedFactor = 1;
    this.globalScaleFactor = 1;
    this.gameEntities = [];
    this.player1Score = 0;
    this.player2Score = 0;
    this.numberHits = 0;
  }

  listenToGameState = (state: GameStateDTO) => {
    switch (state.type) {
      case "LobbyStart":
        const lobbyStartData = <LobbyStartDTO>state.data;
        this.gameType = lobbyStartData.gameType;
        this.player1IntraId = lobbyStartData.player1IntraName;
        this.player2IntraId = lobbyStartData.player2IntraName;
        this.isPrivate = lobbyStartData.isPrivate;

        this.displayLobby!();
        this.stopDisplayQueue!();
        break;
      case "LobbyEnd":
        const lobbyEndData = <LobbyEndDTO>state.data;
        this.gameType = "";
        this.stopDisplayLobby!();
        break;
      case "GameTypeChange":
        const gameTypeChangeData = <GameTypeChangeDTO>state.data;
        this.gameType = gameTypeChangeData.gameType;
        this.setGameType?.(gameTypeChangeData.gameType);
        break;
      case "LobbyCountdown":
        const lobbyCountdownData = <CountdonwDTO>state.data;
        this.lobbyCountdown!();
        break;
      case "LastShot":
        this.zoomSlowMo!(this._pongPosition);
        break;
      case "GameCountdown":
        const gameCountdownData = <CountdonwDTO>state.data;
        break;
      case "GameStart":
        const data = <GameStartDTO>state.data;
        this.isLeft = data.isLeft;
        this.isRight = !data.isLeft;
        this.gameRoom = data.gameRoom;
        this.gameType = data.gameType;
        this.leftPaddleType = this.getPaddleType(data.player1PowerUp);
        this.rightPaddleType = this.getPaddleType(data.player2PowerUp);
        this.startGame();
        this.displayGame();
        break;
      case "GameEnd":
        stopBlackHoleSound();
        this.endGame();
        break;
      case "FieldEffect":
        const fieldEffect = <FieldEffectDTO>state.data;
        this.gameEntities.length = 0;
        this.globalGravityX = 0;
        this.globalGravityY = 0;
        switch (fieldEffect.type) {
          case "NORMAL":
            stopBlackHoleSound();
            this.gameEntities = [];
            break;
          case "GRAVITY":
            this.globalGravityX = 0;
            this.globalGravityY =
              (fieldEffect.magnitude * 2) /
              Math.sqrt(this.pongSpeed.x ** 2 + this.pongSpeed.y ** 2);
            break;
          case "TIME_ZONE":
            this.gameEntities = [
              new GameTimeZone(
                { x: fieldEffect.xPos, y: fieldEffect.yPos, w: 500, h: 500 },
                fieldEffect.magnitude
              ),
            ];
            break;
          case "BLACK_HOLE":
            playBlackHoleSound();
            this.gameEntities = [
              new GameBlackhole(
                { x: fieldEffect.xPos, y: fieldEffect.yPos, w: 100, h: 100 },
                2
              ),
            ];
            break;
          case "BLOCK":
            this.gameEntities = [
              new GameBlock({
                x: fieldEffect.xPos,
                y: fieldEffect.yPos,
                w: 200,
                h: 200,
              }),
            ];
            break;
          default:
            break;
        }
        this.setEntities?.(this.gameEntities);
        break;
      case "CheckCreateInvite":
        const checkCreateInviteData = <CheckCreateInviteDTO>state.data;
        if (
          checkCreateInviteData.type === "success" &&
          this.setCanCreateInvite
        ) {
          this.setCanCreateInvite(true);
        } else if (
          checkCreateInviteData.type === "error" &&
          this.setUnableToCreateInvite
        ) {
          this.setUnableToCreateInvite(true);
        }
        break;
      case "RemoveInvite":
        const removeInviteData = <RemoveInviteDTO>state.data;
        if (removeInviteData.type === "success") {
          this.updateInviteId(-1);
        }
      case "JoinInvite":
        const joinInviteData = <JoinInviteDTO>state.data;
        if (joinInviteData.type === "success" && this.setJoinSuccessful) {
          this.setJoinSuccessful(true);
        } else if (
          joinInviteData.type === "error" &&
          this.setUnableToAcceptInvite
        ) {
          this.setUnableToAcceptInvite(true);
        }
        break;
      default:
        break;
    }
  };

  listenToGameLoopCallBack = (data: GameDTO) => {
    this.hitEffects(data);
    if (this.isLeft) {
      this.rightPaddlePosition = {
        x: 1600 - 45,
        y: Number(data.rightPaddlePosY),
      };
    } else {
      this.leftPaddlePosition = { x: 30, y: Number(data.leftPaddlePosY) };
    }
    this.player1Score = Number(data.player1Score);
    this.player2Score = Number(data.player2Score);

    if (data.blockX && data.blockY)
      this.blockPosition = { x: Number(data.blockX), y: Number(data.blockY) };
    if (this.usingLocalTick) return;
    this._pongSpeed = { x: Number(data.ballVelX), y: Number(data.ballVelY) };
    this._pongPosition = { x: Number(data.ballPosX), y: Number(data.ballPosY) };
    this.pongSpin = Math.abs(Number(data.spin));
    this.attracted = data.attracted;
  };

  listenToGameResponse = (data: GameResponseDTO) => {};

  private hitEffects(data: GameDTO) {
    if (data.hitType === HitType.PADDLE) this.numberHits++;
    if (this.gameType === "boring") return;
    if (
      data.hitType &&
      !(
        data.hitType === HitType.SCORE &&
        (data.player1Score == 10 || data.player2Score == 10)
      )
    ) {
      playGameSound(data.hitType);
    }
    if (!this.hitFilter) return;
    this.pongSpeedMagnitude = Math.sqrt(
      this._pongSpeed.x ** 2 + this._pongSpeed.y ** 2
    );
    if (data.hitType === HitType.SCORE) {
      this.ballHit?.(
        this.pongSpeedMagnitude,
        this._pongPosition,
        this._pongSpeed,
        1,
        data.player1Score == 10 || data.player2Score == 10 ? 0.5 : 1
      );
    } else if (
      data.hitType === HitType.WALL ||
      data.hitType === HitType.PADDLE ||
      data.hitType === HitType.BLOCK
    ) {
      this.ballHitParticle?.();
      this.ballHit?.(
        this.pongSpeedMagnitude,
        this._pongPosition,
        this._pongSpeed,
        0.5,
        1
      );
    }
    if (data.hitType === HitType.PADDLE) {
      this.paddleHitParticle?.();
    }
  }

  updatePlayerPosition(y: number, x: number) {
    if (this.isLeft && !this.attracted) {
      this.leftPaddlePosition = { x: 30, y: y };
    }
    if (this.isRight && !this.attracted) {
      this.rightPaddlePosition = { x: 1600 - 46, y: y };
    }
    this.mousePosition = { x: x, y: y };
    this.sendPlayerMove?.(y, x, this.gameRoom);
  }

  updatePlayerClick(isMouseDown: boolean) {
    if (this.isLeft && this.leftPaddleType === PaddleType.Piiuuuuu) {
      this.leftPaddleSucking = isMouseDown;
    }
    if (this.isRight && this.rightPaddleType === PaddleType.Piiuuuuu) {
      this.rightPaddleSucking = isMouseDown;
    }
    if (
      this.leftPaddleType === PaddleType.Piiuuuuu ||
      this.rightPaddleType === PaddleType.Piiuuuuu
    ) {
      this.sendPlayerClick?.(isMouseDown, this.gameRoom);
    }
  }

  useLocalTick() {
    playEngGameSound();
    this.usingLocalTick = true;
    this.localTicker = new PIXI.Ticker();
    this.tickPerParticles = Math.floor(this.tickPerParticles * 2 + 1);
    this.localTicker.add(this._localTick.bind(this));
    this.localTicker.start();
    this.localTickerPongSpeed = this.pongSpeed;
  }

  disableLocalTick() {
    this.usingLocalTick = false;
    if (!this.localTicker) return;
    this.tickPerParticles = Math.floor((this.tickPerParticles - 1) / 2);
    this._pongSpeed.x = this.localTickerPongSpeed.x;
    this._pongSpeed.y = this.localTickerPongSpeed.y;
    this.gameEntities = [];
    this.localTicker.remove(this._localTick.bind(this));
    this.localTicker.stop();
    this.localTicker.destroy();
    stopEngGameSound();
  }

  private _localTick(delta: number) {
    if (!this.usingLocalTick) return;
    if (this._pongPosition.x <= 0 || this._pongPosition.x >= 1590) {
      this._pongPosition.x = 800;
      this._pongPosition.y = 450;
      this.localTickerPongSpeed.x = 0;
      this.localTickerPongSpeed.y = 0;
      playGameSound(HitType.END_GAME);
    }
    if (this._pongPosition.y <= 0 || this._pongPosition.y >= 900 - 10)
      this.localTickerPongSpeed.y *= -1;

    this._pongPosition.x += this.localTickerPongSpeed.x * delta;
    this._pongPosition.y += this.localTickerPongSpeed.y * delta;
  }

  applGlobalEffectToParticle(particle: GameParticle) {
    particle.vx *= this.globalSpeedFactor;
    particle.vy *= this.globalSpeedFactor;
    particle.ax *= this.globalSpeedFactor;
    particle.ay *= this.globalSpeedFactor;
    particle.w *= this.globalScaleFactor;
    particle.h *= this.globalScaleFactor;
  }

  getPaddleType(val: number) {
    switch (val) {
      case 0:
        return PaddleType.boring;
      case 1:
        return PaddleType.Vzzzzzzt;
      case 2:
        return PaddleType.Ngeeeaat;
      case 3:
        return PaddleType.Piiuuuuu;
      case 4:
        return PaddleType.Vrooooom;
      default:
        return PaddleType.boring;
    }
  }
}
