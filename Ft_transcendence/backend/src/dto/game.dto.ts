import { HitType } from "src/game/entity/gameRoom";
export class GameDTO{
	ballPosX: string;
	ballPosY: string;
	ballVelX: string;
	ballVelY: string;
	leftPaddlePosY: string;
	rightPaddlePosY: string;
	player1Score: string;
	player2Score: string;
	spin: string;
	attracted: boolean;
	blockX: string|null;
	blockY: string|null;
	hitType: HitType;

	constructor(ballPosX: number, ballPosY: number, ballVelX: number, ballVelY: number, leftPaddlePosY: number, rightPaddlePosY: number, player1Score: number, player2Score: number,
		hitType: HitType, spin: number = 0, attracted: boolean=false, blockX: number|null = null, blockY: number|null = null){
		this.ballPosX = ballPosX.toFixed(0);
		this.ballPosY = ballPosY.toFixed(0);
		this.ballVelX = ballVelX.toFixed(2);
		this.ballVelY = ballVelY.toFixed(2);
		this.leftPaddlePosY = leftPaddlePosY.toFixed(0);
		this.rightPaddlePosY = rightPaddlePosY.toFixed(0);
		this.player1Score = player1Score.toFixed(0);
		this.player2Score = player2Score.toFixed(0);
		if (blockX != null || blockY != null){
			this.blockX = blockX.toFixed(0);
			this.blockY = blockY.toFixed(0);
		}
		else{
			this.blockX = null;
			this.blockY = null;
		}
		this.spin = spin.toFixed(2);
		this.attracted = attracted;
		this.hitType = hitType;
	}
}