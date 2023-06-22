import { Rect } from "./rect";

/**
 * Dynamic rectangle entity. Addition of function to update location, check boundry
 * and collision response.
 * Used for dynamic object such as ball and moving block.
 **/
export class DynamicRect extends Rect{
	velX : number;
	velY : number;
	accelX : number;
	accelY : number;

	constructor (posX, posY, width, height, mass = 1){
		super(posX, posY, width, height,mass);
		this.velX = 0;
		this.velY = 0;
		this.accelX = 0;
		this.accelY = 0;
	}

	addVelocity(velX, velY){
		this.velX += velX;
		this.velY += velY;
	}

	initAcceleration(accelX, accelY){
		this.accelX = accelX;
		this.accelY = accelY;
	}

	update(){
		this.velX += this.accelX * (1 / 60);
		this.velY += this.accelY * (1 / 60);
		this.posX += this.velX;
		this.posY += this.velY;
	}

	checkContraint(borderWidth: number, borderHeight: number){
		if (this.posX < 0){
			this.posX = 0;
			this.velX *= -1;
		}
		if (this.posX + this.width > borderWidth){
			this.posX = borderWidth - this.width;
			this.velX *= -1;
		}
		if (this.posY < 0){
			this.posY = 0;
			this.velY *= -1;
		}
		if (this.posY + this.height > borderHeight){
			this.posY = borderHeight - this.height;
			this.velY *= -1;
		}
	}

	collisionResponse(collideTime: number, normalX: number, normalY: number){
		this.posX += this.velX * collideTime;
		this.posY += this.velY * collideTime;
		if (normalX != 0){
			this.velX *= -1;
		}
		if (normalY != 0){
			this.velY *= -1;
		}
	}
}