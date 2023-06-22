import { Ball } from './ball';
import { Rect } from './rect';
import { Paddle } from './paddle';
import { GameSetting } from './gameSetting';
import { Server } from 'socket.io';
import { GameDTO } from 'src/dto/game.dto';
import {
  GameEndDTO,
  GamePauseDTO,
  GameStateDTO,
} from 'src/dto/gameState.dto';
import { Player } from './player';
import { MatchService } from 'src/match/match.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/entity/users.entity';

//Direction refer to which paddle is checking(1 for left, -1 for right, 0 for other than paddle)
//It is pass through in constructor.
export class CollisionResult {
  collided: boolean;
  collideTime: number;
  normalX: number;
  normalY: number;
  direction: number;

  constructor(direction: number) {
    this.collided = false;
    this.collideTime = 0;
    this.normalX = 0;
    this.normalY = 0;
    this.direction = direction;
  }
}

export enum HitType {
  NONE = 0,
  WALL = 1,
  PADDLE = 2,
  SCORE = 3,
  BLOCK = 4,
  SLOW_IN = 5,
  SLOW_OUT = 6,
  FAST_IN = 7,
  FAST_OUT = 8,
}

export class GameRoom {
  roomID: string;
  gameType: string;
  player1: Player;
  player2: Player;
  canvasWidth: number;
  canvasHeight: number;
  ballInitSpeedX: number;
  ballInitSpeedY: number;
  Ball: Ball;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  leftMouseX: number;
  leftMouseY: number;
  rightMouseX: number;
  rightMouseY: number;
  interval: NodeJS.Timer | null;
  resetTime: number;
  lastWinner: string;
  player1Score: number;
  player2Score: number;
  winScore: number;
  gameEnded: boolean;
  gameReset: boolean;
  gamePaused: boolean;
  gamePauseDate: number | null;
  gamePausePlayer: string | null;
  _players: Array<string>;
  roomSettings: GameSetting;
  hitType: HitType = 0;
  matchService: MatchService;
  userService: UserService;
  lastShotSent: number = 0;

  constructor(
    player1: Player,
    player2: Player,
    gameType: string,
    setting: GameSetting,
    matchService: MatchService,
    userService: UserService,
  ) {
    this.roomID = player1.intraName + player2.intraName;
    this.gameType = gameType;
    this.player1 = player1;
    this.player2 = player2;
    this.canvasWidth = setting.canvasWidth;
    this.canvasHeight = setting.canvasHeight;
    this.ballInitSpeedX = setting.ballSpeedX;
    this.ballInitSpeedY = setting.ballSpeedY;

    this.Ball = new Ball(
      this.canvasWidth / 2,
      this.canvasHeight / 2,
      setting.ballSize,
      setting.ballSize,
      setting.ballSpeedX,
      setting.ballSpeedY,
    );
    this.leftPaddle = new Paddle(
      setting.paddleOffsetX,
      this.canvasHeight / 2,
      setting.paddleWidth,
      setting.leftPaddleHeight,
    );
    this.rightPaddle = new Paddle(
      this.canvasWidth - setting.paddleOffsetX - setting.paddleWidth,
      this.canvasHeight / 2,
      setting.paddleWidth,
      setting.rightPaddleHeight,
    );
    this.interval = null;
    this._players = [player1.intraName, player2.intraName];
    this.lastWinner = '';
    this.player1Score = 0;
    this.player2Score = 0;
    this.winScore = setting.scoreToWin;
    this.gameReset = false;
    this.gamePaused = false;

    this.matchService = matchService;
    this.userService = userService;

    this.roomSettings = setting;
    this.hitType = HitType.NONE;
  }

  async run(server: Server) {
    this.resetGame(server);
    this.startGame();
    if (this.interval == null) {
      this.interval = setInterval(async () => {
        if (this.gameReset == true) {
          this.resetGame(server);
          let timer = 2;
          let elapsedTime = (Date.now() - this.resetTime) / 1000;
          if (elapsedTime >= timer) {
            this.startGame();
            this.gameReset = false;
          }
        } else if (this.gamePaused == true) {
          if (Date.now() - this.gamePauseDate > 20000) {
            this.endGame(
              server,
              this.player1.intraName === this.gamePausePlayer
                ? this.player2.intraName
                : this.player1.intraName,
              'abandon',
            );
          }
        } else {
          this.gameUpdate(server);
        }

        if (
          this.player1Score === this.roomSettings.scoreToWin ||
          this.player2Score === this.roomSettings.scoreToWin
        ) {
          this.endGame(
            server,
            this.player1Score === this.roomSettings.scoreToWin
              ? this.player1.intraName
              : this.player2.intraName,
            'score',
          );
        }
      }, 1000 / 60);
    }
  }

  gameUpdate(server: Server) {
    this.Ball.update();
    let score = this.Ball.checkContraint(this.canvasWidth, this.canvasHeight);
    if (score == 1 || score == 2) {
      this.hitType = HitType.SCORE;
      if (score == 1) {
        this.player1Score++;
        this.lastWinner = 'player1';
      } else {
        this.player2Score++;
        this.lastWinner = 'player2';
      }
      this.resetTime = Date.now();
      this.gameReset = true;
    }
    else if (score == 3){
      this.hitType = HitType.WALL;
    }
    else if (score == 0) {
      this.hitType = HitType.NONE;
    }
    this.gameCollisionDetection();
    server
      .to(this.roomID)
      .emit(
        'gameLoop',
        new GameDTO(
          this.Ball.posX,
          this.Ball.posY,
          this.Ball.velX,
          this.Ball.velY,
          this.leftPaddle.posY + 50,
          this.rightPaddle.posY + 50,
          this.player1Score,
          this.player2Score,
          this.hitType,
        ),
      );
  }

  objectCollision(ball: Ball, paddle: Rect, direction: number): CollisionResult {
    let xInvEntry, yInvEntry;
    let xInvExit, yInvExit;
    let xEntry, yEntry;
    let xExit, yExit;
    let entryTime, exitTime;

    let result = new CollisionResult(direction);

    if (ball.velX > 0) {
      xInvEntry = paddle.posX - (ball.posX + ball.width);
      xInvExit = paddle.posX + paddle.width - ball.posX;
    } else {
      xInvEntry = paddle.posX + paddle.width - ball.posX;
      xInvExit = paddle.posX - (ball.posX + ball.width);
    }
    if (ball.velY > 0) {
      yInvEntry = paddle.posY - (ball.posY + ball.height);
      yInvExit = paddle.posY + paddle.height - ball.posY;
    } else {
      yInvEntry = paddle.posY + paddle.height - ball.posY;
      yInvExit = paddle.posY - (ball.posY + ball.height);
    }

    if (ball.velX == 0) {
      xEntry = -Infinity;
      xExit = Infinity;
    } else {
      xEntry = xInvEntry / ball.velX;
      xExit = xInvExit / ball.velX;
    }
    if (ball.velY == 0) {
      yEntry = -Infinity;
      yExit = Infinity;
    } else {
      yEntry = yInvEntry / ball.velY;
      yExit = yInvExit / ball.velY;
    }

    entryTime = Math.max(xEntry, yEntry);
    exitTime = Math.min(xExit, yExit);

    if (
      entryTime > exitTime ||
      (xEntry < 0 && yEntry < 0) ||
      xEntry > 1 ||
      yEntry > 1
    ) {
      return result;
    } else {
      result.collided = true;
      result.collideTime = entryTime;
      if (xEntry > yEntry) {
        if (xInvEntry < 0) {
          result.normalX = 1;
        } else {
          result.normalX = -1;
        }
      } else {
        if (yInvEntry < 0) {
          result.normalY = 1;
        } else {
          result.normalY = -1;
        }
      }
      return result;
    }
  }

  gameCollisionDetection() {
    let result = null;
    if (this.Ball.posX > this.canvasWidth * 0.85) {
      result = this.objectCollision(this.Ball, this.rightPaddle, -1);
    } else if (this.Ball.posX < this.canvasWidth * 0.15) {
      result = this.objectCollision(this.Ball, this.leftPaddle, 1);
    }

    if (result && result.collided) {
      this.hitType = HitType.PADDLE;
      this.Ball.collisionResponse(result.collideTime, result.normalX, result.normalY);
    }
  }

  updatePlayerPos(socketId: string, xValue: number, yValue: number) {
    if (socketId == this.player1.socket.id) {
      this.leftPaddle.posY = yValue - this.leftPaddle.height / 2;
      this.leftMouseX = xValue;
      this.leftMouseY = yValue;
    }
    if (socketId == this.player2.socket.id) {
      this.rightPaddle.posY = yValue - this.rightPaddle.height / 2;
      this.rightMouseX = xValue;
      this.rightMouseY = yValue;
    }
  }

  updatePlayerMouse(socketId: string, isMouseDown: boolean) {
  }

  resumeGame(player: Player) {
    this.gamePaused = false;
    this.gamePauseDate = null;
    this.gamePausePlayer = null;
  }

  togglePause(server: Server, pausePlayer: string) {
    if (this.gamePaused) this.endGameNoMatch();
    this.gamePaused = true;
    this.gamePauseDate = Date.now();
    this.gamePausePlayer = pausePlayer;
    server
      .to(this.roomID)
      .emit(
        'gameState',
        new GameStateDTO('GamePause', new GamePauseDTO(this.gamePauseDate)),
      );
  }

  async endGame(server: Server, winner: string, wonBy: string) {
    clearInterval(this.interval);
    server
      .to(this.roomID)
      .emit(
        'gameState',
        new GameStateDTO(
          'GameEnd',
          new GameEndDTO(this.player1Score, this.player2Score),
        ),
      );
    this.gameEnded = true;
    this.player1.socket.leave(this.roomID);
    this.player2.socket.leave(this.roomID);
    this.matchService.createNewMatch(
      await this.userService.getUserDataByIntraName(this.player1.accessToken, this.player1.intraName),
      await this.userService.getUserDataByIntraName(this.player2.accessToken, this.player2.intraName),
      this.player1Score,
      this.player2Score,
      winner,
      this.gameType,
      wonBy,
    );

    let WINNER: User;
    let LOSER: User;
    let loser: string;

    if (winner === this.player1.intraName) {
      WINNER = await this.userService.getUserDataByIntraName(
        this.player1.accessToken,
        this.player1.intraName,
      );
      LOSER = await this.userService.getUserDataByIntraName(
        this.player2.accessToken,
        this.player2.intraName,
      );
      loser = this.player2.intraName;
    } else {
      WINNER = await this.userService.getUserDataByIntraName(
        this.player2.accessToken,
        this.player2.intraName,
      );
      LOSER = await this.userService.getUserDataByIntraName(
        this.player1.accessToken,
        this.player1.intraName,
      );
      loser = this.player1.intraName;
    }

    let winnerElo = WINNER.elo;
    let loserElo = LOSER.elo;
    let expected = 1 / (10 ** ((loserElo - winnerElo) / 400) + 1)
    let change = Math.round(40 * (1 - expected));

    winnerElo += change;
    loserElo -= change;

    this.userService.updateUserElo(loser, loserElo, false);
    this.userService.updateUserElo(winner, winnerElo, true);
  }

  endGameNoMatch() {
    clearInterval(this.interval);
    this.gameEnded = true;
  }

  /**
   * Reset the game state. Called when game first started or if one player score
   * 	Set the ball position to the center of the canvas
   * 	Set the ball velocity to 0
   * 	Check which player score and set ball velocity to the opposite side
   */
  resetGame(server: Server) {
    this.Ball.posX = this.canvasWidth / 2;
    this.Ball.posY = this.canvasHeight / 2;
    this.Ball.velX = 0;
    this.Ball.velY = 0;
    this.Ball.accelX = 0;
    this.Ball.accelY = 0;
    this.Ball.spinY = 0;
    this.Ball.accelerating = false;
    this.Ball.spinning = false;
    this.Ball.attracted = false;
    this.Ball.initialSpeedX = this.ballInitSpeedX;
    this.Ball.initialSpeedY = this.ballInitSpeedY;
    this.hitType = HitType.NONE;
    this.lastShotSent = 0;
    server
      .to(this.roomID)
      .emit(
        'gameLoop',
        new GameDTO(
          this.Ball.posX,
          this.Ball.posY,
          this.Ball.velX,
          this.Ball.velY,
          this.leftPaddle.posY + 50,
          this.rightPaddle.posY + 50,
          this.player1Score,
          this.player2Score,
          this.hitType,
        ),
      );
  }

  /**
   * Called when reset timer end.Set the ball velocity based on last winner
   */
  startGame(){
    this.hitType = HitType.NONE;
    if (this.lastWinner.length == 0) {
      this.Ball.velX =
        this.ballInitSpeedX * (Math.round(Math.random()) === 0 ? -1 : 1);
      this.Ball.velY =
        this.ballInitSpeedY * (Math.round(Math.random()) === 0 ? -1 : 1);
    } else if (this.lastWinner == 'player1') {
      this.Ball.velX = this.ballInitSpeedX;
      this.Ball.velY =
        this.ballInitSpeedY * (Math.round(Math.random()) === 0 ? -1 : 1);
    } else if (this.lastWinner == 'player2') {
      this.Ball.velX = -this.ballInitSpeedX;
      this.Ball.velY =
        this.ballInitSpeedY * (Math.round(Math.random()) === 0 ? -1 : 1);
    }
  }
}
