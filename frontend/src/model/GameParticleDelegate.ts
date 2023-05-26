import { GameData } from "../game/gameData";
import { GameBlackhole, GameTimeZone } from "./GameEntities";
import { Offset } from "./GameModels";
import GameParticle from "./GameParticle";

class GameParticleDelegate {
  particles: GameParticle[] = [];
  particleCycle: number = 0;
  paddleParticleCycle: number = 0;
  gameData: GameData;
  spinEffectThreshold: number = 15;
  speedEffectThreshold: number = 20;

  constructor(gameData: GameData) {
    this.gameData = gameData;
  }

  update(
    addSprite: (sprite: GameParticle) => void,
    removeSprite: (sprite: GameParticle) => void,
    delta: number
  ) {
    const newPosition = this.gameData.pongPosition;
    const newPongSpeed = this.gameData.pongSpeed;
    let pongSpeedMagnitude = Math.sqrt(
      newPongSpeed.x ** 2 + newPongSpeed.y ** 2
    );
    this.gameData.gameEntities.forEach((entity) => {
      if (entity instanceof GameTimeZone) {
        const distance = Math.sqrt(
          Math.pow(newPosition.x - entity.x, 2) +
            Math.pow(newPosition.y - entity.y, 2)
        );
        if (distance < 1 || distance > entity.w / 2) return;
        pongSpeedMagnitude /= entity.timeFactor;
      }
    });
    this.particles.forEach((particle) => {
      if (particle.opacity <= 0.01) {
        this.particles.splice(this.particles.indexOf(particle), 1);
        removeSprite(particle);
        return;
      }
      let finalTimeFactor = 1;
      this.gameData.gameEntities.forEach((entity) => {
        if (entity instanceof GameBlackhole) {
          if (!particle.affectedByGravity) return;
          const distance = Math.sqrt(
            Math.pow(particle.x - entity.x, 2) +
              Math.pow(particle.y - entity.y, 2)
          );
          if (distance < 1 || distance > 300) return;
          if (distance < 10) particle.opacity = 0;
          particle.setGravityAccel(entity.x, entity.y, entity.magnitude);
        }
        if (entity instanceof GameTimeZone) {
          const distance = Math.sqrt(
            Math.pow(particle.x - entity.x, 2) +
              Math.pow(particle.y - entity.y, 2)
          );
          if (distance < 1 || distance > entity.w / 2) return;
          finalTimeFactor *= entity.timeFactor;
        }
      });
      this.gameData.applGlobalEffectToParticle(particle);
      particle.update({ timeFactor: finalTimeFactor, delta: delta });
    });
    // add particles
    if (this.particleCycle === this.gameData.tickPerParticlesSpawn)
      this.particleCycle = 0;
    else this.particleCycle++;
    if (this.particleCycle !== 0) return this.particles;
    this.addTrailingParticle(
      this.particles,
      newPosition,
      newPongSpeed,
      addSprite
    );
    this.addBlackholeParticle(this.gameData, this.particles, addSprite);

    if (pongSpeedMagnitude !== 0) {
      let colorIndex = 0;
      if (this.gameData.pongSpin > this.spinEffectThreshold) {
        this.addSpitParticleRed(
          this.particles,
          newPosition,
          newPongSpeed,
          addSprite
        );
        colorIndex = 4;
      }
      if (pongSpeedMagnitude > this.speedEffectThreshold) {
        this.addSpitParticleCyan(
          this.particles,
          newPosition,
          newPongSpeed,
          addSprite
        );
        colorIndex = 1;
      }
      if (
        this.gameData.pongSpin > this.spinEffectThreshold ||
        pongSpeedMagnitude > this.speedEffectThreshold
      ) {
        this.addSpitParticle(
          this.particles,
          newPosition,
          newPongSpeed,
          addSprite
        );
      }
      if (
        this.gameData.pongSpin > this.spinEffectThreshold &&
        pongSpeedMagnitude > this.speedEffectThreshold
      ) {
        colorIndex = 2;
      }
      this.addTrailParticle(
        this.particles,
        newPosition,
        newPongSpeed,
        colorIndex,
        addSprite
      );
    }
    if (this.paddleParticleCycle === 2) this.paddleParticleCycle = 0;
    else this.paddleParticleCycle++;
    if (this.paddleParticleCycle !== 0) return this.particles;
    this.addPaddleParticle(this.particles, addSprite);

    return this.particles;
  }

  addTrailParticle(
    newParticles: GameParticle[],
    newPosition: Offset,
    newSpeed: Offset,
    colorIndex: number,
    addSprite: (sprite: GameParticle) => void
  ) {
    let numberOfParticles = 4;
    if (this.gameData.usingLocalTick) numberOfParticles = 1;
    for (let i = 0; i < numberOfParticles; i++) {
      const newParticle = new GameParticle({
        x: newPosition.x - (newSpeed.x * i) / numberOfParticles,
        y: newPosition.y - (newSpeed.y * i) / numberOfParticles,
        opacity: 0.6,
        vx: 0.12,
        vy: 0.12,
        opacityDecay: 0.02,
        sizeDecay: 0.3,
        w: 10,
        h: 10,
        colorIndex: colorIndex,
        affectedByGravity: false,
      });
      newParticle.update({ delta: i / numberOfParticles });
      addSprite(newParticle);
      newParticles.push(newParticle);
    }
  }

  addBlackholeParticle(
    gameData: GameData,
    newParticles: GameParticle[],
    addSprite: (sprite: GameParticle) => void
  ) {
    gameData.gameEntities.forEach((entity) => {
      if (entity.type !== "blackhole") return;
      const x =
        entity.x +
        (Math.random() > 0.2 ? 1 : -1) * 30 +
        30 * (Math.random() - 0.5);
      const y =
        entity.y +
        (Math.random() > 0.5 ? -1 : -1) * 30 +
        30 * (Math.random() - 0.5);
      const size = 2 + 8 * Math.random();
      const newParticle = new GameParticle({
        x: x,
        y: y,
        opacity: 1,
        vx: (entity.x - x) / 10 + 7 + 2,
        vy: (y - entity.y) / 10 + (Math.random() > 0.5 ? 1 : -1) + 5,
        opacityDecay: 0.005,
        w: size,
        h: size,
        colorIndex: 2,
      });
      addSprite(newParticle);
      newParticles.push(newParticle);
    });
  }

  addSpitParticleRed(
    newParticles: GameParticle[],
    newPosition: Offset,
    newPongSpeed: Offset,
    addSprite: (sprite: GameParticle) => void
  ) {
    for (let i = 0; i < 2; i++) {
      const size = 6 + 4 * Math.random();
      const newParticle = new GameParticle({
        x: newPosition.x + 5 - 10 / 2,
        y: newPosition.y + 5 - 10 / 2,
        opacity: 1,
        opacityDecay: 0.02,
        vx: newPongSpeed.x * 1.5 + (Math.random() - 0.5) * 3,
        vy: newPongSpeed.y * 1.5 + (Math.random() - 0.5) * 3,
        w: size,
        h: size,
        speedDecayFactor: 0.95,
        colorIndex: 4,
        affectedByTimeZone: false,
      });
      addSprite(newParticle);
      newParticles.push(newParticle);
    }
  }

  addSpitParticleCyan(
    newParticles: GameParticle[],
    newPosition: Offset,
    newPongSpeed: Offset,
    addSprite: (sprite: GameParticle) => void
  ) {
    for (let i = 0; i < 2; i++) {
      const size = 6 + 4 * Math.random();
      const newParticle = new GameParticle({
        x: newPosition.x + 5 - 10 / 2,
        y: newPosition.y + 5 - 10 / 2,
        opacity: 1,
        opacityDecay: 0.02,
        vx: newPongSpeed.x * 1.5 + (Math.random() - 0.5) * 3,
        vy: newPongSpeed.y * 1.5 + (Math.random() - 0.5) * 3,
        w: size,
        h: size,
        speedDecayFactor: 0.95,
        colorIndex: 1,
        affectedByTimeZone: false,
      });
      addSprite(newParticle);
      newParticles.push(newParticle);
    }
  }

  addSpitParticle(
    newParticles: GameParticle[],
    newPosition: Offset,
    newPongSpeed: Offset,
    addSprite: (sprite: GameParticle) => void
  ) {
    for (let i = 0; i < 2; i++) {
      const size = 2 + 3 * Math.random();
      const newParticle = new GameParticle({
        x: newPosition.x + 5 - 10 / 2,
        y: newPosition.y + 5 - 10 / 2,
        opacity: 0.8,
        opacityDecay: 0.02,
        vx: newPongSpeed.x * 1.5 + (Math.random() - 0.5) * 3,
        vy: newPongSpeed.y * 1.5 + (Math.random() - 0.5) * 3,
        w: size,
        h: size,
        speedDecayFactor: 0.95,
        affectedByTimeZone: false,
      });
      addSprite(newParticle);
      newParticles.push(newParticle);
    }
  }

  addTrailingParticle(
    newParticles: GameParticle[],
    newPosition: Offset,
    newPongSpeed: Offset,
    addSprite: (sprite: GameParticle) => void
  ) {
    const newParticle = new GameParticle({
      x: newPosition.x - 5 + 20 * Math.random(),
      y: newPosition.y - 5 + 20 * Math.random(),
      opacity: 1,
      opacityDecay: 0.02,
      vx: newPongSpeed.y * (Math.random() - 0.5) * 0.3,
      vy: newPongSpeed.x * (Math.random() - 0.5) * 0.3,
      w: 3,
      h: 3,
    });
    addSprite(newParticle);
    newParticles.push(newParticle);
  }

  addPaddleParticle(
    newParticles: GameParticle[],
    addSprite: (sprite: GameParticle) => void
  ) {
    const leftPaddle = this.gameData.leftPaddlePosition;
    let newParticle = new GameParticle({
      x: leftPaddle.x + 15 * Math.random(),
      y: leftPaddle.y + 100 * (Math.random() - 0.5),
      opacity: 0.5,
      opacityDecay: 0.02,
      vx: 6 * (Math.random() - 0.5),
      vy: 3 * (Math.random() - 0.5),
      speedDecayFactor: 0.9,
      w: 5,
      h: 5,
    });
    addSprite(newParticle);
    newParticles.push(newParticle);
    const rightPaddle = this.gameData.rightPaddlePosition;
    newParticle = new GameParticle({
      x: rightPaddle.x + 15 * Math.random(),
      y: rightPaddle.y + 100 * (Math.random() - 0.5),
      opacity: 0.5,
      opacityDecay: 0.02,
      vx: 6 * (Math.random() - 0.5),
      vy: 3 * (Math.random() - 0.5),
      speedDecayFactor: 0.9,
      w: 5,
      h: 5,
    });
    addSprite(newParticle);
    newParticles.push(newParticle);
  }
}

export default GameParticleDelegate;
