import { Ref, RefObject, useRef } from "react";
import * as PIXI from "pixi.js";

/**
 * GameParticleData
 * @interface GameParticleData
 * @param {number} x x position
 * @param {number} y y position
 * @param {number} vx velocity x
 * @param {number} vy velocity y
 * @param {number} ax acceleration x
 * @param {number} ay acceleration y
 * @param {number} jx jerk x
 * @param {number} jy jerk y
 * @param {number} w width
 * @param {number} h height
 * @param {number} rotRad rotation in radians
 * @param {number} opacity
 * @param {number} opacityDecay
 * @param {number} speedDecayFactor
 * @param {number} sizeDecay
 * @param {number} sizeDecayFactor
 * @param {number} colorIndex
 * @param {boolean} affectedByGravity
 */
interface GameParticleData {
  id?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  ax?: number;
  ay?: number;
  jx?: number;
  jy?: number;
  w?: number;
  h?: number;
  rotRad?: number;
  opacity?: number;
  opacityDecay?: number;
  sizeDecay?: number;
  sizeDecayFactor?: number;
  speedDecayFactor?: number;
  colorIndex?: number;
  affectedByGravity?: boolean;
  affectedByTimeZone?: boolean;
}
interface ParticleUpdateData {
  timeFactor?: number;
  globalGravityX?: number;
  globalGravityY?: number;
  delta?: number;
}

/**
 * @class GameParticle
 * @param {number} x x position
 * @param {number} y y position
 * @param {number} vx velocity x
 * @param {number} vy velocity y
 * @param {number} ax acceleration x
 * @param {number} ay acceleration y
 * @param {number} jx jerk x
 * @param {number} jy jerk y
 * @param {number} w width
 * @param {number} h height
 * @param {number} rotRad rotation in radians
 * @param {number} opacity
 * @param {number} opacityDecay
 * @param {number} speedDecayFactor
 * @param {number} sizeDecay
 * @param {number} colorIndex
 */
class GameParticle {
  public id: string;
  public sprite: PIXI.Sprite | null;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public ax: number;
  public ay: number;
  public jx: number;
  public jy: number;
  public w: number;
  public h: number;
  public rotRad: number;
  public opacity: number;
  public opacityDecay: number;
  public speedDecayFactor: number;
  public sizeDecay: number;
  public sizeDecayFactor: number;
  public colorIndex: number;
  public affectedByGravity: boolean;
  public affectedByTimeZone: boolean;

  constructor({
    id,
    x,
    y,
    vx,
    vy,
    ax,
    ay,
    jx,
    jy,
    w,
    h,
    rotRad,
    opacity,
    opacityDecay,
    speedDecayFactor,
    colorIndex,
    sizeDecay,
    sizeDecayFactor,
    affectedByGravity,
    affectedByTimeZone,
  }: GameParticleData) {
    this.id =
      id ?? `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.vx = vx ?? 0;
    this.vy = vy ?? 0;
    this.ax = ax ?? 0;
    this.ay = ay ?? 0;
    this.jx = jx ?? 0;
    this.jy = jy ?? 0;
    this.w = w ?? 0;
    this.h = h ?? 0;
    this.rotRad = rotRad ?? 0;
    this.opacity = opacity ?? 0;
    this.opacityDecay = opacityDecay ?? 0;
    this.speedDecayFactor = speedDecayFactor ?? 1;
    this.sizeDecay = sizeDecay ?? 0;
    this.sizeDecayFactor = sizeDecayFactor ?? 1;
    this.colorIndex = colorIndex ?? 0;
    this.affectedByGravity = affectedByGravity ?? true;
    this.affectedByTimeZone = affectedByTimeZone ?? true;
    this.sprite = null;
  }

  get data(): GameParticleData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      ax: this.ax,
      ay: this.ay,
      jx: this.jx,
      jy: this.jy,
      w: this.w,
      h: this.h,
      opacity: this.opacity,
    };
  }

  public update({
    timeFactor = 1,
    globalGravityX = 0,
    globalGravityY = 0,
    delta = 1,
  }: ParticleUpdateData) {
    if (!this.affectedByTimeZone) timeFactor = 1;
    if (this.opacity <= 0) return;
    this.x += this.vx * timeFactor * delta;
    this.y += this.vy * timeFactor * delta;
    this.vx += (this.ax + globalGravityX) * timeFactor * delta;
    this.vy += (this.ay + globalGravityY) * timeFactor * delta;
    this.ax += this.jx * timeFactor * delta;
    this.ay += this.jy * timeFactor * delta;
    this.opacity -= Math.max(this.opacityDecay * timeFactor * delta, 0);
    if (this.sizeDecay != 0) {
      this.w -= Math.max(this.sizeDecay * timeFactor * delta, 0);
      this.h -= Math.max(this.sizeDecay * timeFactor * delta, 0);
    }
    if (this.speedDecayFactor != 0) {
      this.vx *= this.speedDecayFactor ** delta;
      this.vy *= this.speedDecayFactor ** delta;
    }
    if (this.sizeDecayFactor != 1) {
      this.w *= this.sizeDecayFactor ** delta;
      this.h *= this.sizeDecayFactor ** delta;
    }
    if (this.sprite == null) return;
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    this.sprite.rotation = this.rotRad;
    this.sprite.alpha = this.opacity;
    this.sprite.width = this.w;
    this.sprite.height = this.h;
  }

  /**
   * @param x x position of the gravity source
   * @param y y position of the gravity source
   * @param magnitude the magnitude of the gravity in jolt
   *
   * should not be used with setGravityAccel
   */
  public setGravityJolt(x: number, y: number, magnitude: number) {
    if (!this.affectedByGravity) return;
    this.jx = (this.x - x) * magnitude;
    this.jy = (this.y - y) * magnitude;
  }

  /**
   * @param x x position of the gravity source
   * @param y y position of the gravity source
   * @param magnitude the magnitude of the gravity in accel
   *
   * should not be used with setGravityJolt
   */
  public setGravityAccel(x: number, y: number, magnitude: number) {
    if (!this.affectedByGravity) return;
    this.ax = (x - this.x) * magnitude * 0.005;
    this.ay = (y - this.y) * magnitude * 0.005;
  }
}

interface GameLightningParticleData {
  centerX: number;
  centerY: number;
  paddingX: number;
  paddingY: number;
}

class GameLightningParticle {
  particles: GameParticle[];
  centerX: number;
  centerY: number;
  paddingX: number;
  paddingY: number;
  currentTagetX: number;
  currentTagetY: number;
  pointIndex: number;
  constructor({
    centerX,
    centerY,
    paddingX,
    paddingY,
  }: GameLightningParticleData) {
    this.particles = [];
    this.centerX = centerX;
    this.centerY = centerY;
    this.paddingX = paddingX;
    this.paddingY = paddingY;
    this.currentTagetX = this.centerX;
    this.currentTagetY = this.centerY;
    this.pointIndex = 0;
  }

  public update(
    addSprite: (sprite: GameParticle) => void,
    removeSprite: (sprite: GameParticle) => void
  ) {
    this.particles.forEach((particle) => {
      if (particle.opacity <= 0.01) {
        this.particles.splice(this.particles.indexOf(particle), 1);
        removeSprite(particle);
        return;
      }
      particle.update({});
    });
    if (this.particles.length > 12) {
      for (let i = 0; i < this.particles.length - 12; i++) {
        this.particles[i].opacityDecay = 0.05;
      }
    }
    this.addParticle(addSprite);
    if (
      Math.abs(
        this.currentTagetX - this.particles[this.particles.length - 1].x
      ) < 10 &&
      Math.abs(
        this.currentTagetY - this.particles[this.particles.length - 1].y
      ) < 10
    ) {
      if (this.pointIndex == 0) {
        this.currentTagetX =
          this.centerX + this.paddingX + 5 * (Math.random() - 0.5);
        this.currentTagetY =
          this.centerY + this.paddingY + 5 * (Math.random() - 0.5);
      } else if (this.pointIndex == 1) {
        this.currentTagetX =
          this.centerX - this.paddingX + 5 * (Math.random() - 0.5);
        this.currentTagetY =
          this.centerY + this.paddingY + 5 * (Math.random() - 0.5);
      } else if (this.pointIndex == 2) {
        this.currentTagetX =
          this.centerX - this.paddingX + 5 * (Math.random() - 0.5);
        this.currentTagetY =
          this.centerY - this.paddingY + 5 * (Math.random() - 0.5);
      } else if (this.pointIndex == 3) {
        this.currentTagetX =
          this.centerX + this.paddingX + 5 * (Math.random() - 0.5);
        this.currentTagetY =
          this.centerY - this.paddingY + 5 * (Math.random() - 0.5);
      }
      this.pointIndex++;
      if (this.pointIndex > 3) this.pointIndex = 0;
    }
  }

  private addParticle(addSprite: (sprite: GameParticle) => void) {
    if (this.particles.length == 0) {
      const newParticle = new GameParticle({
        x: this.centerX + this.paddingX,
        y: this.centerY - this.paddingY,
        opacity: 0.7,
        w: 10,
        h: 20 + 30 * Math.random(),
        colorIndex: 3,
        rotRad: Math.PI / 2,
      });
      this.particles.push(newParticle);
      addSprite(newParticle);
    } else {
      for (let i = 0; i < 2; i++) {
        const lastParticle = this.particles[this.particles.length - 1];
        const newStartX =
          lastParticle.x - (lastParticle.h - 3) * Math.sin(lastParticle.rotRad);
        const newStartY =
          lastParticle.y + (lastParticle.h - 3) * Math.cos(lastParticle.rotRad);
        const distance = Math.sqrt(
          Math.pow(this.currentTagetX - newStartX, 2) +
            Math.pow(this.currentTagetY - newStartY, 2)
        );
        let newParticle: GameParticle;
        if (distance < 51) {
          newParticle = new GameParticle({
            x: newStartX,
            y: newStartY,
            opacity: 0.7,
            w: 5 + 10 * Math.random(),
            h: distance,
            colorIndex: 3,
            rotRad:
              Math.PI +
              Math.atan2(
                this.currentTagetX - lastParticle.x,
                lastParticle.y - this.currentTagetY
              ),
          });
        } else {
          newParticle = new GameParticle({
            x:
              lastParticle.x -
              (lastParticle.h - 3) * Math.sin(lastParticle.rotRad),
            y:
              lastParticle.y +
              (lastParticle.h - 3) * Math.cos(lastParticle.rotRad),
            opacity: 0.7,
            w: 5 + 15 * Math.random(),
            h: 20 + 30 * Math.random(),
            colorIndex: 3,
            rotRad:
              Math.PI +
              Math.atan2(
                this.currentTagetX - lastParticle.x,
                lastParticle.y - this.currentTagetY
              ),
          });
          this.particles.push();
        }
        this.particles.push(newParticle);
        addSprite(newParticle);
      }
    }
  }
}

export { GameLightningParticle };
export default GameParticle;
