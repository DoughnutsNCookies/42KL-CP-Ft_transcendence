interface GameEntityData {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  w?: number;
  h?: number;
}

class GameEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  type: string;
  constructor({ x, y, vx, vy, w, h }: GameEntityData) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.vx = vx ?? 0;
    this.vy = vy ?? 0;
    this.w = w ?? 0;
    this.h = h ?? 0;
    this.type = "entity";
  }
}

class GameBlackhole extends GameEntity {
  magnitude: number;
  constructor({ x, y, vx, vy, w, h }: GameEntityData, magnitude: number) {
    super({ x, y, vx, vy, w, h });
    this.magnitude = magnitude;
    this.type = "blackhole";
  }
}

class GameTimeZone extends GameEntity {
  timeFactor: number;
  constructor({ x, y, vx, vy, w, h }: GameEntityData, speedFactor: number) {
    super({ x, y, vx, vy, w, h });
    this.timeFactor = speedFactor ?? 1;
    this.type = "timezone";
  }
}

class GameBlock extends GameEntity {
  compressionSpeedX: number;
  compressionSpeedY: number;
  constructor({ x, y, vx, vy, w, h }: GameEntityData) {
    super({ x, y, vx, vy, w, h });

    this.compressionSpeedX = 0;
    this.compressionSpeedY = 0;
  }

  compressionDecay() {
    this.w += this.compressionSpeedX;
    this.h += this.compressionSpeedY;
    if (this.compressionSpeedX > 0) this.compressionSpeedY += 0.1;
    else this.compressionSpeedY -= 0.1;
    if (this.compressionSpeedY > 0) this.compressionSpeedX += 0.1;
    else this.compressionSpeedX -= 0.1;
    this.compressionSpeedX *= 0.9;
    this.compressionSpeedY *= 0.9;
  }
}

export { GameBlackhole, GameTimeZone, GameBlock };
export default GameEntity;
