import GameEntity, { GameBlackhole } from "../model/GameEntities";
import GameParticle from "../model/GameParticle";

let interval: number;
const gameParticles: GameParticle[] = [];
let gameEntities: GameEntity[] = [];
let pongPosition: { x: number; y: number } = { x: 0, y: 0 };
let pongSpeed: { x: number; y: number } = { x: 0, y: 0 };

function eventLoop() {
  interval = setInterval(() => {
    gameParticles.forEach((particle) => {
      if (particle.opacity <= 0) {
        gameParticles.splice(gameParticles.indexOf(particle), 1);
      }
      gameEntities.forEach((entity) => {
        if (entity.type == "blackhole")
          particle.setGravityAccel(entity.x, entity.y, 2);
      });
      particle.update({});
    });
    gameParticles.push(
      new GameParticle({
        x: pongPosition.x - 5 + 20 * Math.random(),
        y: pongPosition.y - 5 + 20 * Math.random(),
        opacity: 1,
        opacityDecay: 0.02,
        vx: pongSpeed.y * (Math.random() - 0.5) * 0.3,
        vy: pongSpeed.x * (Math.random() - 0.5) * 0.3,
        w: 3,
        h: 3,
      })
    );
    for (let i = 0; i < 2; i++) {
      gameParticles.push(
        new GameParticle({
          x: pongPosition.x + 5 - 10 / 2,
          y: pongPosition.y + 5 - 10 / 2,
          opacity: 0.8,
          opacityDecay: 0.02,
          vx: pongSpeed.x * 1.5 + (Math.random() - 0.5) * 3,
          vy: pongSpeed.y * 1.5 + (Math.random() - 0.5) * 3,
          w: 5,
          h: 5,
          speedDecayFactor: 0.95,
        })
      );
    }
    for (let i = 0; i < 2; i++) {
      gameParticles.push(
        new GameParticle({
          x: pongPosition.x + 5 - 10 / 2,
          y: pongPosition.y + 5 - 10 / 2,
          opacity: 1,
          opacityDecay: 0.02,
          vx: pongSpeed.x * 1.5 + (Math.random() - 0.5) * 3,
          vy: pongSpeed.y * 1.5 + (Math.random() - 0.5) * 3,
          w: 10,
          h: 10,
          speedDecayFactor: 0.95,
          colorIndex: 1,
        })
      );
    }

    gameEntities.forEach((entity) => {
      if (entity.type !== "blackhole") return;
      var x =
        entity.x +
        (Math.random() > 0.2 ? 1 : -1) * 30 +
        30 * (Math.random() - 0.5);
      var y =
        entity.y +
        (Math.random() > 0.5 ? 1 : -1) * 30 +
        30 * (Math.random() - 0.5);
      gameParticles.push(
        new GameParticle({
          x: x,
          y: y,
          opacity: 1,
          vx: (entity.x - x) / 10 + 7,
          vy: (y - entity.y) / 10 + (Math.random() > 0.5 ? 1 : -1),
          opacityDecay: 0.005,
          w: 7,
          h: 7,
          colorIndex: 2,
        })
      );
    });

    gameParticles.push(
      new GameParticle({
        x: pongPosition.x,
        y: pongPosition.y,
        opacity: 1,
        vx: 0.12,
        vy: 0.12,
        opacityDecay: 0.03,
        sizeDecay: 0.3,
        w: 10,
        h: 10,
        colorIndex: 0,
        affectedByGravity: false,
      })
    );
    self.postMessage({ type: "gameParticles", value: gameParticles });
  }, 1000 / 60);
}

self.onmessage = (e) => {
  switch (e.data.type) {
    case "pongPosition":
      pongPosition = e.data.value;
      break;
    case "pongSpeed":
      pongSpeed = e.data.value;
      break;
    case "gameEntities":
      gameEntities.length = 0;
      gameEntities = e.data.value;
      break;
    case "start":
      eventLoop();
      break;
    case "stop":
      clearInterval(interval);
      break;
  }
};
