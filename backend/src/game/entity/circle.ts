import { DynamicRect } from "./dynamicRect";
import { HitType } from "./gameRoom";

export class Circle{
	posX: number;
	posY: number;
	radius: number;

	constructor(posX: number, posY: number, radius: number){
		this.posX = posX;
		this.posY = posY;
		this.radius = radius;
	}

	checkInside(x: number, y: number): boolean{
		let distance = Math.sqrt(Math.pow(x - this.posX, 2) + Math.pow(y - this.posY, 2));
		return distance < this.radius;
	}

	pull(rect: DynamicRect, effectRadius: number, force: number){
		const dx = rect.posX - this.posX;
		const dy = rect.posY - this.posY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < this.radius * effectRadius && distance > this.radius){
			const theta = Math.atan2(dy, dx);
			const fg = Math.min(force * 500 / (distance * distance), 20);

			let accelX = -fg * Math.cos(theta) * 2;
			let accelY = -fg * Math.sin(theta) * 2;
			rect.accelX = accelX;
			rect.accelY = accelY;
		}
		else{
			rect.accelX = 0;
			rect.accelY = 0;
		}
	}
	
}