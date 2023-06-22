import { GameData } from "../game/gameData";
import GameParticle from "./GameParticle";
import { update } from "lodash";

export enum GameGravityArrowDiraction {
  UP,
  DOWN,
}

interface GameGravityArrowParameters {
  arrowsParticles: GameParticle[];
  diraction: GameGravityArrowDiraction;
}

export class GameGravityArrow {
  arrowsParticles: GameParticle[];
  diraction: GameGravityArrowDiraction;
  constructor({ arrowsParticles, diraction }: GameGravityArrowParameters) {
    this.arrowsParticles = arrowsParticles;
    this.diraction = diraction;
  }
  cycle: number = 0;
  posCycle: number = 0;

  get isUp(): boolean {
    return this.diraction === GameGravityArrowDiraction.UP;
  }

  get isDown(): boolean {
    return this.diraction === GameGravityArrowDiraction.DOWN;
  }

  get color(): number {
    switch (this.diraction) {
      case GameGravityArrowDiraction.UP:
        return 0xd2b24f;
      case GameGravityArrowDiraction.DOWN:
        return 0xc5a1ff;
      default:
        return 0x000000;
    }
  }

  update(
    addSprite: (sprite: GameParticle) => void,
    removeSprite: (sprite: GameParticle) => void,
    delta: number
  ) {
    this.arrowsParticles.forEach((arrowParticle) => {
      if (arrowParticle.y > 1200 || arrowParticle.y < -300) {
        this.arrowsParticles.splice(
          this.arrowsParticles.indexOf(arrowParticle),
          1
        );
        removeSprite(arrowParticle);
        return;
      }
      arrowParticle.update({ delta: delta });
    });
    const closeness = Math.random();
    const size = 10 + 30 * closeness;
    const speed = 2 + 3 * closeness;
    if (this.cycle === 0) {
      const newParticle = new GameParticle({
        x: (1600 / 12) * this.posCycle,
        y: this.isDown ? -300 : 1200,
        vx: 0,
        vy: speed * (this.isDown ? 1 : -1),
        opacity: 0.1 + 0.1 * closeness,
        w: 3 * size,
        h: 8 * size,
        affectedByGravity: false,
        affectedByTimeZone: false,
      });
      this.arrowsParticles.push(newParticle);
      addSprite(newParticle);
    }
    this.cycle++;
    this.posCycle++;
    if (this.cycle > 20) {
      this.cycle = 0;
    }
    if (this.posCycle > 12) {
      this.posCycle = 0;
    }
  }
}
