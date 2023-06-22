import { Rect } from "./rect";
import { Ball } from "./ball";
import { PowerUp } from "../game.service";

/**
 * @param powerUp current powerUp for paddle
 * @param energized boolean variable to check the paddle is energized
 * @param speedIncrementX speed increment in x direction when using speed powerUp
 * @param speedIncrementY speed increment in y direction when using speed powerUp
 * @param lastPosY Position of paddle in previous frame
 * @param prevDeltas Array of previous deltas of paddle position. Used to calculate spin
 * @param spinRequirement Minimum delta required to trigger spin
 * @param spinForce Force of spin
 */
export class Paddle extends Rect {
	powerUp: PowerUp;
	speedIncrementX: number;
	speedIncrementY: number;
	lastPosY: number;
	prevDeltas: number[] =[];
	spinRequirement: number;
	spinForce: number;
	mouseDown: boolean = false;
	canMove: boolean = true;


	constructor(posX, posY, width, height, mass: number=1, powerUp: PowerUp = PowerUp.NORMAL) {
		super(posX, posY, width, height, mass);
		this.powerUp = powerUp;
		this.lastPosY = 0;

		//Config Setting for PowerUp
		this.speedIncrementX = 4;
		this.speedIncrementY = 2;
		this.spinRequirement = 4;
		this.spinForce = 0.75;
	}

	paddleCollisionAction(ball: Ball, collideTime: number, normalX: number, normalY: number){
		if (ball.spinning == true){
			let elapseTime = Date.now() - ball.lastHitTimer;
			if (elapseTime > 500){
				ball.resetSpin();
			}
		}
		const avgDelta = this.prevDeltas.reduce((a, b) => a + b, 0) / this.prevDeltas.length;
		if (ball.energized == true && this.powerUp != PowerUp.SPEED){
			ball.resetVelocity();
			ball.energized = false;
		}
		if (Math.abs(avgDelta) > this.spinRequirement){
			ball.spin(-this.spinForce * avgDelta)
			if (this.powerUp == PowerUp.SPIN){
				ball.spin(-this.spinForce * avgDelta * 2);
			}
			else if (this.powerUp == PowerUp.SPEED){
				ball.spin(-this.spinForce * avgDelta * 0.5);
			}
		}
		switch (this.powerUp){
			case PowerUp.NORMAL:
				ball.collisionResponse(collideTime, normalX, normalY);
				break;
			case PowerUp.SIZE:
				ball.collisionResponse(collideTime, normalX, normalY);
				break;
			case PowerUp.SPEED:
				ball.collisionResponse(collideTime, normalX, normalY);
				ball.energizedBall(this.speedIncrementX, this.speedIncrementY);
				ball.energized = true;
				break;
			case PowerUp.SPIN:
				ball.collisionResponse(collideTime, normalX, normalY);
				break;
			case PowerUp.PRECISION:
				if (this.mouseDown == true){
					this.canMove = false;
					ball.attracted = true;
					ball.spinY = 0;
				}
				else{
					ball.collisionResponse(collideTime, normalX, normalY);
				}

		}
	}

	updateDelta(): number{
		let delta = this.posY - this.lastPosY;
		this.lastPosY = this.posY;
		this.prevDeltas.push(delta);
		if (this.prevDeltas.length > 5){
			this.prevDeltas.shift();
		}
		return (delta);
	}
}
