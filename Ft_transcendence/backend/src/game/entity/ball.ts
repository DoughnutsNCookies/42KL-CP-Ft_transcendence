import { DynamicRect } from "./dynamicRect";

/**
 * Ball class. modify the check constraint function to score instead of bounce
 */
export class Ball extends DynamicRect{
	initialSpeedX: number;
	initialSpeedY: number;
	prevX: number = 0;
	prevY: number = 0;
	spinY: number = 0;
	lastHitTimer: number;
	accelerating: boolean =false;
	spinning: boolean = false;
	hitWall: boolean = false;
	hitPaddle: boolean = false;
	energized: boolean = false;
	attracted: boolean = false;
	velocityMagnitude: number;

	constructor (posX: number, posY: number, width: number, height: number, 
		initSpeedX: number, initSpeedY: number, mass: number = 1){
		super(posX, posY, width, height,mass);

		this.initialSpeedX = initSpeedX;
		this.initialSpeedY = initSpeedY;
		this.velocityMagnitude = Math.sqrt(initSpeedX * initSpeedX + initSpeedY * initSpeedY);

		this.prevY;
	}

	/**
	 * Return 1 or 2 if the ball hit the left or right border respectively.
	 * Return 3 if the ball hit the top or bottom border.
	 * Return 0 otherwise.
	 */
	checkContraint(borderWidth: number, borderHeight: number) : number{
		if (this.posX <= 0){
			this.posX = 0;
			return 2;
		}
		if (this.posX + this.width >= borderWidth - 30){
			this.posX = borderWidth - this.width;
			return 1;
		}
		if (this.posY <= 0){
			this.posY = 0;
			this.velY *= -1;
			return 3
		}
		if (this.posY + this.height >= borderHeight){
			this.posY = borderHeight - this.height;
			this.velY *= -1;
			return 3
		}
		return 0;
	}

	impulsCollisionResponse(object: DynamicRect, normalX, normalY) {
		let relVelocityX = object.velX - this.velX;
		let relVelocityY = object.velY - this.velY;		
		let velAlongNormal = relVelocityX * normalX + relVelocityY * normalY;
		
		if (velAlongNormal > 0) {
		  return;
		}

		let e = 1;
		let j = -(1 + e) * velAlongNormal;
		let invMass = 1 / this.mass;
		let otherInvMass = 1/object.mass;
		j /= invMass + otherInvMass;
		
		let impulseX = j * normalX;
		let impulseY = j * normalY;
		object.velX += impulseX * otherInvMass;
		object.velY += impulseY * otherInvMass;
	}

	spin(force:number){
		this.spinning = true;
		this.spinY = force;
	}

	update(){
		if (this.energized == false){
			this.prevX = this.initialSpeedX;
			this.prevY = this.initialSpeedY;
		}
		if (this.spinning == true){
			if (this.hitWall == true){
				this.resetSpin();
			}
		}
		if (this.accelerating == true){
			if (this.accelY == 0 && (this.hitWall == true || this.hitPaddle == true)){
				this.accelerating = false;
				this.velX = this.prevX * Math.sign(this.velX);
				this.velY = this.prevY * Math.sign(this.velY);
			}
		}
		this.velX += this.accelX * (1 / 60);
		this.velY += (this.accelY + this.spinY) * (1 / 60);

		if (this.attracted == true){
			this.velX = 0;
			this.velY = 0;
		}
		else{
			this.posX += this.velX;
			this.posY += this.velY;
		}
	}

	energizedBall(incrementX: number, incrementY: number){
		if (this.energized == false){
			this.velX = Math.sign(this.velX) * (Math.abs(this.velX) + incrementX);
			this.velY = Math.sign(this.velY) * (Math.abs(this.velY) + incrementY);
			this.prevX = this.initialSpeedX + incrementX;
			this.prevY = this.initialSpeedY + incrementY;
		}
	}

	resetVelocity(){
		this.velX = Math.sign(this.velX) * this.initialSpeedX;
		this.velY = Math.sign(this.velY) * this.initialSpeedY;
	}

	resetSpin(){
		this.spinning = false;
		this.spinY = 0;
		this.velY = this.prevY * Math.sign(this.velY);
	}

	launchBall(mouseX: number, mouseY: number){
		let dirX = mouseX - this.posX;
		let dirY = mouseY - this.posY;
		let magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
		if (magnitude != 0){
			dirX /= magnitude;
			dirY /= magnitude;

			let velX = dirX * this.velocityMagnitude;
			let velY = dirY * this.velocityMagnitude;
			this.initialSpeedX = Math.abs(velX);
			this.initialSpeedY = Math.abs(velY);
			this.attracted = false;
			this.velX = velX;
			this.velY = velY;
		}
	}
}