/**
 * Basic rectangle entity. Have a constuctor that define its dimension and mass.
 * Used for static object such as paddle, and field efffect.
 **/
export class Rect{
	posX : number;
	posY : number;
	width : number;
	height : number;
	mass : number;

	constructor (posX, posY, width, height, mass = 1){
		this.posX = posX;
		this.posY = posY;
		this.width = width;
		this.height = height;
		this.mass = mass;
	}
}