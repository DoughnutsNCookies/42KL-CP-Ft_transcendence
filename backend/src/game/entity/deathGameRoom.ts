import { GameRoom, HitType } from "./gameRoom";
import { Player }  from "./player"; 
import { GameSetting } from "./gameSetting";
import { Server } from "socket.io";
import { GameDTO } from "src/dto/game.dto";
import { GameStateDTO } from 'src/dto/gameState.dto';
import { MatchService } from "src/match/match.service";
import { UserService } from "src/user/user.service";

export class DeathGameRoom extends GameRoom{
	lastShotSent: number = 0;

	constructor (player1: Player, player2: Player, gameType: string, setting: GameSetting, matchService: MatchService, userService: UserService){
		super(player1, player2, gameType, setting, matchService, userService);
	}

	gameUpdate(server: Server){
		this.Ball.update();
		
		this.leftPaddle.updateDelta();
		this.rightPaddle.updateDelta();

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
			this.gameReset = true;
		}

		if (score == 3){
			this.hitType = HitType.WALL;
		}

		if (this.player2Score === this.roomSettings.scoreToWin - 1){
      if (this.Ball.posX < this.roomSettings.paddleOffsetX + this.leftPaddle.width && this.lastShotSent == 0) {
				this.lastShotSent = 1;
        server.to(this.roomID).emit('gameState', new GameStateDTO('LastShot', null));
      }
    }

    if (this.player1Score === this.roomSettings.scoreToWin - 1){
      if (this.Ball.posX > this.canvasWidth - this.roomSettings.paddleOffsetX - this.rightPaddle.width - this.Ball.width && this.lastShotSent == 0) {
				this.lastShotSent = 1;
        server.to(this.roomID).emit('gameState', new GameStateDTO('LastShot', null));
      }
    }

		this.gameCollisionDetection();
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

	gameCollisionDetection(){
		let result = null;
		if (this.Ball.posX > this.canvasWidth * 0.85){
			result = this.objectCollision(this.Ball, this.rightPaddle, -1);
		}
		else if(this.Ball.posX < this.canvasWidth * 0.15){
			result = this.objectCollision(this.Ball, this.leftPaddle, 1);
		}
		
		if (result && result.collided){
			this.hitType = HitType.PADDLE;
			this.Ball.hitPaddle = true;
			this.Ball.velX = Math.sign(this.Ball.velX) * (Math.abs(this.Ball.velX) + 0.5);
			this.Ball.velY = Math.sign(this.Ball.velY) * (Math.abs(this.Ball.velY) + 0.5);
			this.Ball.initialSpeedX = Math.abs(this.Ball.velX);
			this.Ball.initialSpeedY = Math.abs(this.Ball.velY);
			if (result.direction == 1){
				this.leftPaddle.paddleCollisionAction(this.Ball,
					result.collideTime,
					result.normalX,result.normalY);
			}
			else if (result.direction == -1){
				this.rightPaddle.paddleCollisionAction(this.Ball,
					result.collideTime,
					result.normalX,result.normalY);
			}
			this.Ball.lastHitTimer = Date.now();
		}
		else{
			this.Ball.hitPaddle = false;
		}
	}
}