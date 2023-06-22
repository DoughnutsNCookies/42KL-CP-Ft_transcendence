export enum GameMode{
	BORING,
	STANDARD,
	DEATH
}

export class GameSetting{
	canvasWidth: number;
	canvasHeight: number;
	ballSpeedX: number;
	ballSpeedY: number;

	ballSize: number;
	paddleWidth: number;
	leftPaddleHeight: number;
	rightPaddleHeight: number;
	paddleOffsetX: number;
	paddleOffsetY: number;

	scoreToWin: number;
	gameMode: GameMode;

	constructor(leftPaddleHeight: number, rightPaddleHeight: number, gameMode: GameMode, scoreToWin?: number){
		this.canvasWidth = 1600;
		this.canvasHeight = 900;
		this.ballSpeedX = 15;
		this.ballSpeedY = 6;
		this.ballSize = 10;
		this.paddleWidth = 15;
		this.leftPaddleHeight = leftPaddleHeight;
		this.rightPaddleHeight = rightPaddleHeight;
		this.paddleOffsetX = 30;
		this.paddleOffsetY = 50;
		this.scoreToWin = scoreToWin || 10;
		this.gameMode = gameMode;
	}
}