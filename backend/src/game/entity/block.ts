import { DynamicRect } from "./dynamicRect"

export class Block extends DynamicRect{
	constructor (posX, posY, width, height, mass = 1){
		super(posX, posY, width, height,mass);
	}

	update(){
		this.posX += this.velX * 0.7;
		this.posY += this.velY * 0.7;
	}
}