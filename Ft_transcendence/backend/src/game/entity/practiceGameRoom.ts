import { PowerUp } from "../game.service";
import { PowerGameRoom } from "./powerGameRoom";
import { Player } from "./player";
import { GameMode, GameSetting } from "./gameSetting";
import { GameDTO } from "src/dto/game.dto";
import { Server } from "socket.io";
import { GameEndDTO, GameStateDTO } from "src/dto/gameState.dto";
import { HitType } from "./gameRoom";

enum FieldEffect{
	NORMAL = 0,
	GRAVITY,
	TIME_ZONE,
	BLACK_HOLE,
	BLOCK
}

export class PracticeGameRoom extends PowerGameRoom {
  constructor(player: Player, player1PowerUp: PowerUp) {
    super(player, new Player("Bot"), "standard", new GameSetting(100, 100, GameMode.STANDARD), player1PowerUp, PowerUp.NORMAL)
	}

  gameUpdate(server: Server){	
		this.elapseTime = (Date.now() - this.startTime) / 1000;
		this.paddleElapseTime = (Date.now() - this.paddleTimer) / 1000;
		this.Ball.update();

		this.rightPaddle.posY = this.Ball.posY - 50;

		this.leftPaddle.updateDelta();
		this.rightPaddle.updateDelta();

		if (this.Ball.attracted == true){
			this.hitType = HitType.NONE;
			if (this.Ball.posX < this.canvasWidth / 2){
				this.Ball.posX = this.roomSettings.paddleOffsetX + this.leftPaddle.width;
				if (this.leftPaddle.mouseDown == false){
					this.Ball.launchBall(this.leftMouseX, this.leftMouseY);
				}
			}
			else{
				this.Ball.posX = this.canvasWidth - this.roomSettings.paddleOffsetX - this.rightPaddle.width - this.Ball.width;
				if (this.rightPaddle.mouseDown == false){
					this.Ball.launchBall(this.rightMouseX, this.rightMouseY);
				}
			}
		}

		let score = this.Ball.checkContraint(this.canvasWidth, this.canvasHeight);
		if (score != 0){
			this.Ball.hitWall = true;
		}
		else{
			this.Ball.hitWall = false;
			this.hitType = HitType.NONE;
		}

		if (score == 1 || score == 2){
			this.hitType = HitType.SCORE;
			if (score == 1){
				this.player1Score++;
				this.lastWinner = "player1";
			}
			else{
				this.player2Score++;
				this.lastWinner = "player2";
			}
			this.resetTime = Date.now();
			this.paddleTimer = Date.now();
			this.insideField = false;
			this.Ball.energized =false;
			this.gameReset = true;
			this.Ball.accelerating = false;
			this.Ball.spinning = false;
		}

		if (score == 3){
			this.hitType = HitType.WALL;
			if (this.currentEffect != FieldEffect.GRAVITY){
				this.Ball.accelX = 0;
				this.Ball.accelY = 0;
			}
		}

		if (this.currentEffect == FieldEffect.GRAVITY){
			this.Ball.initAcceleration(0, this.gravityPower * this.effectMagnitude);
			this.Ball.accelerating = true;
		}
		
		if (this.elapseTime >= this.fieldEffectTimer){
			this.fieldChange(server);
			this.startTime = Date.now();
			this.fieldEffectTimer = Math.random() * (this.maxTime - this.minTime) + this.minTime;
			this.needReset = true;
			this.effectContinuousTimer = this.fieldEffectTimer - 2;
		}
		else if (this.elapseTime >= this.effectContinuousTimer && this.needReset == true){
			this.needReset = false;
			this.fieldReset(server);
		}
		
		if (this.paddleElapseTime >= this.paddleResetTimer){
			this.paddleTimer = Date.now();
			this.insideField = false;
			this.resetGame(server);
			this.startGame();
		}

		if (this.circleObject != null){
			this.fieldEffect();
		}

		this.gameCollisionDetection();

		if (this.player2Score == this.roomSettings.scoreToWin - 1){
      if (this.Ball.posX < this.roomSettings.paddleOffsetX + this.leftPaddle.width && this.lastShotSent == 0 && this.Ball.posX > 10) {
        this.lastShotSent = 1;
        server.to(this.roomID).emit('gameState', new GameStateDTO('LastShot', null));
      }
    }

    if (this.player1Score == this.roomSettings.scoreToWin - 1){
      if (this.Ball.posX > this.canvasWidth - this.roomSettings.paddleOffsetX - this.rightPaddle.width - this.Ball.width && this.lastShotSent == 0
        && this.Ball.posX < this.canvasWidth - 10) {
        this.lastShotSent = 1;
        server.to(this.roomID).emit('gameState', new GameStateDTO('LastShot', null));
      }
    }

		if (this.blockObject != null){
			this.blockObject.update();
			this.blockObject.checkContraint(this.canvasWidth, this.canvasHeight);
			server.to(this.roomID).emit('gameLoop',new GameDTO(
				this.Ball.posX, 
				this.Ball.posY, 
				this.Ball.velX, 
				this.Ball.velY,
				this.leftPaddle.posY + (this.leftPaddle.height/2), 
				this.rightPaddle.posY + (this.rightPaddle.height/2), 
				this.player1Score, 
				this.player2Score,
				this.hitType, 
				this.Ball.spinY, 
				this.Ball.attracted,
				this.blockObject.posX + (this.blockSize/2),
				this.blockObject.posY + (this.blockSize/2)));
		}
		else{
			server.to(this.roomID).emit('gameLoop',new GameDTO(
				this.Ball.posX,
				this.Ball.posY,
				this.Ball.velX,
				this.Ball.velY,
				this.leftPaddle.posY + (this.leftPaddle.height/2),
				this.rightPaddle.posY + (this.rightPaddle.height/2),
				this.player1Score,
				this.player2Score,
				this.hitType,
				this.Ball.spinY,
				this.Ball.attracted));
		}
  }

  updatePlayerPos(socketId: string, xValue: number, yValue: number) {
    if (socketId == this.player1.socket.id) {
      this.leftPaddle.posY = yValue - this.leftPaddle.height / 2;
      this.leftMouseX = xValue;
      this.leftMouseY = yValue;
    }
  }

	updatePlayerMouse(socketId: string, isMouseDown: boolean): void {
		if (socketId == this.player1.socket.id){
			if (this.leftPaddle.canMove == false){
				if (isMouseDown == false){
					this.leftPaddle.canMove = true;
				}
			}
			this.leftPaddle.mouseDown = isMouseDown;
		}
	}

  togglePause(server: Server, pausePlayer: string) {
    this.endGameNoMatch();
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
  }

}