import React, { RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Container, Text, Graphics, useTick, withFilters, useApp, ParticleContainer, Sprite } from '@pixi/react'
import Paddle from './game_objects/Paddle';
import { BoxSize, Offset } from '../model/GameModels';
import Pong from './game_objects/Pong';
import RippleEffect, { Ring } from './game_objects/RippleEffect';
import * as PIXI from 'pixi.js';
import DashLine from './game_objects/DashLine';
import GameText from './game_objects/GameText';
import { GameDataCtx } from '../GameApp';
import ParticlesRenderer from './game_objects/ParticlesRenderer';
import Entities from './game_objects/Entities';
import GameEntity, { GameBlackhole, GameBlock, GameTimeZone } from '../model/GameEntities';
import GameParticle, { GameLightningParticle } from '../model/GameParticle';
import sleep from '../functions/sleep';
import { GameData, PaddleType } from './gameData';
import { GameGravityArrow, GameGravityArrowDiraction } from '../model/GameGravityArrow';
import ColorTween from './functions/colorInterpolation';
import { DropShadowFilter, RGBSplitFilter, ShockwaveFilter } from 'pixi-filters';
import InwardShadow from './game_objects/InwardShadow';
import { clamp, update } from 'lodash';
import { playGameSound, HitType } from '../functions/audio';
import GameEndText from './game_objects/GameEndText';

interface GameProps {
  scale: number;
  shouldRender: boolean;
  usingTicker?: boolean;
}

function Game(props: GameProps) {
  const { scale, shouldRender, usingTicker } = props;
  const gameData = useContext(GameDataCtx);
  const [mounted, setMounted] = useState(false);
  const [gameGravityArrow, setGameGravityArrow] = useState<GameGravityArrow | null>(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [numberHits, setNumberHits] = useState(0);
  const [bgColor, setBgColor] = useState(0x242424);
  const [bgColorTween, setBgColorTween] = useState<ColorTween | undefined>(undefined);
  const app = useApp();
  const [gameEndText, setGameEndText] = useState<JSX.Element>(<></>);

  const timeRef = useRef<number[]>([]);
  const fpsTextRef = useRef<PIXI.Text>(null);

  const containerRef = useRef<PIXI.Container>(null);
  const shadowRef = useRef<PIXI.Container>(null);
  const zoomSlowMoRef = useRef<PIXI.Ticker | null>(null);
  const ballEffectRef = useRef<boolean>(false);

  const ballhit = useCallback(async (pongSpeedMagnitude: number, hitPosition: Offset, pongSpeed: Offset, strength: number, tickerSpeed: number) => {
    if (ballEffectRef.current === true) return;
    ballEffectRef.current = true;
    await sleep(30);
    ballEffectRef.current = false;
    if (containerRef.current === null) return;
    if (shadowRef.current === null) return;
    if (containerRef.current.filters !== null) containerRef.current.filters = null;
    const shockwaveSpeed = pongSpeedMagnitude / 5 * scale * strength;
    const rgbSplitMagnitude = strength;
    const shockwaveFilter = new ShockwaveFilter();
    shockwaveFilter.center = [hitPosition.x * scale, hitPosition.y * scale];
    shockwaveFilter.time = 0;
    shockwaveFilter.amplitude = 150 * scale * strength / tickerSpeed;
    shockwaveFilter.wavelength = 5 / scale / tickerSpeed;
    shockwaveFilter.radius = 1900 * scale * strength / tickerSpeed;
    shockwaveFilter.brightness = 1.5;
    const rgbSplitFilter = new RGBSplitFilter();
    rgbSplitFilter.red = new PIXI.Point(-pongSpeed.x * rgbSplitMagnitude, -pongSpeed.y * rgbSplitMagnitude);
    rgbSplitFilter.green = new PIXI.Point(0, 0);
    rgbSplitFilter.blue = new PIXI.Point(pongSpeed.x * rgbSplitMagnitude, pongSpeed.y * rgbSplitMagnitude);
    shadowRef.current.alpha = gameData.gameType === "death" ? 1 : 0.7;

    const ticker = new PIXI.Ticker();
    const tickerCallback = (delta: number) => {
      if (shadowRef.current === null) return;
      if (containerRef.current === null) return;
      if (shadowRef.current.alpha >= 0.5)
        shadowRef.current.alpha *= 0.995 ** delta;
      shockwaveFilter.time += 0.01 * shockwaveSpeed * delta;
      if (shockwaveFilter.brightness > 1)
        shockwaveFilter.brightness *= 0.96 ** delta;
      shockwaveFilter.wavelength += 2 * shockwaveSpeed * delta;
      shockwaveFilter.amplitude *= 0.95 ** delta;
      (rgbSplitFilter.red as PIXI.Point).x *= 0.95 ** delta;
      (rgbSplitFilter.red as PIXI.Point).y *= 0.95 ** delta;
      (rgbSplitFilter.blue as PIXI.Point).x *= 0.95 ** delta;
      (rgbSplitFilter.blue as PIXI.Point).y *= 0.95 ** delta;
      if (shockwaveFilter.time >= scale / strength * 1.5) {
        ticker.remove(tickerCallback);
        ticker.stop();
        containerRef.current.filters = null;
      }
    };
    ticker.add(tickerCallback);
    ticker.start();
    containerRef.current.filters = [shockwaveFilter, rgbSplitFilter];
  }, [scale]);

  useEffect(() => {
    gameData.ballHit = ballhit;
    gameData.zoomSlowMo = (position: Offset) => zoomSlowmo(position, zoomSlowMoRef, gameData, app, containerRef, scale, displayGameEndText);
  }, [scale]);

  useEffect(() => {
    setMounted(true);
    app.ticker.speed = 1;
    gameData.zoomSlowMo = (position: Offset) => zoomSlowmo(position, zoomSlowMoRef, gameData, app, containerRef, scale, displayGameEndText);
    return () => setMounted(false);
  }, []);

  useTick((delta) => {
    if (!gameData.gameDisplayed || !mounted) return;
    const newPongSpeed = gameData.pongSpeed;
    const pongSpeedMagnitude = Math.sqrt(newPongSpeed.x ** 2 + newPongSpeed.y ** 2);
    let newGameGravityArrow = gameGravityArrow;

    updateFpsText(fpsTextRef, timeRef);

    newGameGravityArrow = setGravityArrow(pongSpeedMagnitude, newGameGravityArrow);
    if (bgColorTween) {
      if (bgColorTween.done) setBgColorTween(undefined);
      bgColorTween.update(0.05 * delta)
      setBgColor(bgColorTween.colorSlerp);
    }
    setGameGravityArrow(newGameGravityArrow);
    setPlayer1Score(gameData.player1Score);
    setPlayer2Score(gameData.player2Score);
    if (gameData.gameType === "death") setNumberHits(gameData.numberHits);
    if (gameData.gameType === "boring") {
      if ((gameData.player1Score === 10 && gameData.isLeft) || (gameData.player2Score === 10 && gameData.isRight))
        setGameEndText(<GameText text='Win' position={{ x: 800, y: 450 }} anchor={0.5} fontSize={250} fontWeight='900' />);
      else if (gameData.player1Score === 10 || gameData.player2Score === 10)
        setGameEndText(<GameText text='Lose' position={{ x: 800, y: 450 }} anchor={0.5} fontSize={250} fontWeight='900' />);
      if (gameData.player1Score === 10 || gameData.player2Score === 10) {
        setTimeout(() => {
          setGameEndText(<></>);
        }, 7000);
      }
    }
    // ballHitEffect(gameData, newPosition, player1Score, player2Score, ballhit, pongSpeedMagnitude, newPongSpeed, leftPaddlePosition, rightPaddlePosition);
  }, usingTicker ?? true);

  const backgoundTexture = useMemo(() => {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(bgColor, 0.1);
    graphics.drawRect(0, 0, 16, 9);
    graphics.endFill();
    return app.renderer.generateTexture(graphics);
  }, [bgColor]);

  if (!shouldRender) return <></>;
  return (
    <>
      <Container ref={containerRef} width={1600} height={900} scale={scale} eventMode='auto'>
        <Sprite width={1600} height={900} texture={backgoundTexture} />
        {gameData.gameType === "boring" ? <></> : <Container ref={shadowRef} alpha={0.5}>
          <InwardShadow />
        </Container>}
        <Container x={850} y={900} anchor={0.5}>
          <GameText text='PONG' anchor={new PIXI.Point(1, 1)} fontSize={250} position={{ x: 150, y: 0 }} opacity={0.1} />
          <GameText text='sh' anchor={new PIXI.Point(0, 1.1)} fontSize={150} position={{ x: 130, y: 0 }} opacity={0.1} />
        </Container>
        {
          gameData.gameType === "death" ? <GameText text={numberHits.toString()} anchor={new PIXI.Point(0.5, -0.1)} fontSize={200} position={{ x: 800, y: 0 }} opacity={0.3} /> :
            <>
              <GameText text={player1Score.toString()} anchor={new PIXI.Point(1.5, -0.1)} fontSize={200} position={{ x: 800, y: 0 }} opacity={0.3} />
              <GameText text={":"} anchor={new PIXI.Point(0.5, 0)} fontSize={200} position={{ x: 800, y: 0 }} opacity={0.3} />
              <GameText text={player2Score.toString()} anchor={new PIXI.Point(-0.5, -0.1)} fontSize={200} position={{ x: 800, y: 0 }} opacity={0.3} />
            </>
        }
        <Pong size={{ w: 10, h: 10 }} />
        <Entities />
        {gameData.gameType === "boring" ? <></> : <ParticlesRenderer key={"particle renderer"} gameGravityArrow={gameGravityArrow} />}
        <Paddle left={true} />
        <Paddle left={false} />
        {gameEndText}
      </Container>
      <Text ref={fpsTextRef} style={new PIXI.TextStyle({ fill: 0xB3A183, fontSize: 16 })} x={10} y={5} />
    </>
  )

  function setGravityArrow(pongSpeedMagnitude: number, newGameGravityArrow: GameGravityArrow | null) {
    if (gameData.globalGravityY !== 0) {
      gameData.globalGravityY = Math.sign(gameData.globalGravityY) * 2 / pongSpeedMagnitude;
      if (!bgColorTween && bgColor !== (gameData.globalGravityY > 0 ? 0xc5a1ff : 0xd2b24f)) {
        setBgColorTween(new ColorTween({ start: bgColor, end: gameData.globalGravityY > 0 ? 0xc5a1ff : 0xd2b24f }));
      }
      if (!gameGravityArrow) {
        newGameGravityArrow = new GameGravityArrow({ arrowsParticles: [], diraction: gameData.globalGravityY > 0 ? GameGravityArrowDiraction.DOWN : GameGravityArrowDiraction.UP });
      }
    }
    else if (gameData.gameType === 'death' && !bgColorTween && bgColor !== 0xAD6454) {
      setBgColorTween(new ColorTween({ start: bgColor, end: 0xAD6454 }));
    }
    else if ((gameData.gameType === 'standard' || gameData.gameType === 'boring') && bgColor !== 0x242424 && !bgColorTween) {
      setBgColorTween(new ColorTween({ start: bgColor, end: 0x242424 }));
      newGameGravityArrow = null;
    }
    return newGameGravityArrow;
  }

  function displayGameEndText(win: boolean) {
    const random = Math.floor(Math.random() * 5);
    if (win) {
      setGameEndText(<GameEndText text={winPhrase[random]} winner />)
    } else {
      setGameEndText(<GameEndText text={losePhrase[random]} />)
    }
    setTimeout(() => {
      setGameEndText(<></>)
    }, 5000);
  }
}

const winPhrase = [
  'YOU WIN',
  'EZ PZ',
  'SO GOOD, SO SMOOTH',
  'VICTORY',
  'NOT BAD, INDEED',
  'WHAT A SHOT!!',
  'W FOR WINNERS',
  'YOU ARE THE GOAT',
  'YOU ARE THE MVP',
  "LEGENDARY!",
]

const losePhrase = [
  'YOU LOSE',
  'SO BAD, SO SAD',
  'DEFEAT',
  'WHAT A SHAME!!',
  'GO BACK TO WORK',
  'YOU SUCK',
  'WHAT ARE YOU DOING',
  'L FOR LOSER',
  'BOO HOO',
  'AIM BETTER PLZ',
]

export default Game

function updateFpsText(fpsTextRef: React.RefObject<PIXI.Text>, timeRef: React.MutableRefObject<number[]>) {
  if (fpsTextRef.current !== null) {
    const currentTime = Date.now();
    timeRef.current.push(currentTime);
    if (timeRef.current.length > 10) {
      let average = 0;
      timeRef.current.forEach((time, index) => {
        if (index === 0) return;
        average += time - timeRef.current[index - 1];
      });
      average /= timeRef.current.length - 1;
      const fps = (1000 / average).toFixed(1);
      fpsTextRef.current.text = `FPS: ${fps}`;
      timeRef.current.length = 0;
    }
  }
}

// function ballHitEffect(
//   gameData: GameData,
//   newPosition: Readonly<Offset>,
//   player1Score: number,
//   player2Score: number,
//   ballhit: (pongSpeedMagnitude: number, hitPosition: Offset, pongSpeed: Offset, strength: number, tickerSpeed: number) => Promise<void>,
//   pongSpeedMagnitude: number,
//   newPongSpeed: Readonly<Offset>,
//   leftPaddlePosition: Offset,
//   rightPaddlePosition: Offset
// ) {
//   if (!gameData.hitFilter) return;
//   if (newPosition.x <= 5 || newPosition.x >= 1600 - 15) {
//     if (player1Score === 10 || player2Score === 10) {
//       ballhit(pongSpeedMagnitude, newPosition, newPongSpeed, 1, 0.5);
//     } else {
//       ballhit(pongSpeedMagnitude, newPosition, newPongSpeed, 1, 1);
//     }
//   }

//   if (newPosition.y <= 0 || newPosition.y >= 900 - 10) {
//     ballhit(pongSpeedMagnitude, newPosition, newPongSpeed, 0.5, 1);
//   }

//   if (newPosition.x <= leftPaddlePosition.x + 30
//     && newPosition.x >= leftPaddlePosition.x - 30
//     && newPosition.y >= leftPaddlePosition.y - 60
//     && newPosition.y <= leftPaddlePosition.y + 60) {
//     ballhit(pongSpeedMagnitude, newPosition, newPongSpeed, 0.5, 1);
//   }
//   if (newPosition.x <= rightPaddlePosition.x + 30
//     && newPosition.x >= rightPaddlePosition.x - 30
//     && newPosition.y >= rightPaddlePosition.y - 60
//     && newPosition.y <= rightPaddlePosition.y + 60) {
//     ballhit(pongSpeedMagnitude, newPosition, newPongSpeed, 0.5, 1);
//   }
// }

async function zoomSlowmo(newPosition: Readonly<Offset>, zoomSlowMoRef: React.MutableRefObject<PIXI.Ticker | null>, gameData: GameData, app: PIXI.Application<PIXI.ICanvas>, containerRef: React.RefObject<PIXI.Container<PIXI.DisplayObject>>, scale: number, displayGameEndText: (win: boolean) => void) {
  if (zoomSlowMoRef.current !== null) return;
  gameData.useLocalTick();
  const x = (newPosition.x <= 800 ? 0 : 1600);
  const y = newPosition.y;
  zoomSlowMoRef.current = new PIXI.Ticker();
  zoomSlowMoRef.current.speed = 0.4;
  let t = 0;
  if (gameData.localTicker)
    gameData.localTicker.speed = 0.15;
  app.ticker.speed *= 0.15;

  const tickerCallback = (delta: number) => {
    if (!containerRef.current) return;
    if (!zoomSlowMoRef.current) return;
    const speed = Math.max(app.ticker.speed * (0.8 ** delta), 0.03);
    const scaleVal = Math.log10((t + 1) * 10) * 2 * scale;
    if (gameData.localTicker)
      gameData.localTicker.speed = speed;
    app.ticker.speed = speed;
    containerRef.current.scale.x = scaleVal;
    containerRef.current.scale.y = scaleVal;
    containerRef.current.pivot.x = x;
    containerRef.current.pivot.y = y;
    containerRef.current.position.x = x * scale;
    containerRef.current.position.y = y * scale;
    t += delta;
    if (t >= 55) {
      containerRef.current.scale.x = scale;
      containerRef.current.scale.y = scale;
      containerRef.current.pivot.x = 0;
      containerRef.current.pivot.y = 0;
      containerRef.current.position.x = 0;
      containerRef.current.position.y = 0;
      app.ticker.speed = 1;
      displayGameEndText((gameData.player1Score === (gameData.gameType === "death" ? 1 : 10) && gameData.isLeft) || (gameData.player2Score === (gameData.gameType === "death" ? 1 : 10) && gameData.isRight));
      zoomSlowMoRef.current.remove(tickerCallback);
      zoomSlowMoRef.current.stop();
      if (gameData.localTicker)
        gameData.localTicker.speed = 1;
      zoomSlowMoRef.current = null;
      gameData.disableLocalTick();
    }
  };
  zoomSlowMoRef.current.add(tickerCallback);
  zoomSlowMoRef.current.start();
}
// let particleCycle = 0;
// function updateParticles(particles: GameParticle[], gameData: GameData, newPosition: Offset, newPongSpeed: Offset, pongSpeedMagnitude: number) {

//   const newParticles = [...particles];
//   newParticles.forEach((particle) => {
//     if (particle.opacity <= 0.01) {
//       newParticles.splice(newParticles.indexOf(particle), 1);
//     }
//     let finalTimeFactor = 1;
//     gameData.gameEntities.forEach((entity) => {
//       if (entity instanceof GameBlackhole) {
//         if (!particle.affectedByGravity) return;
//         const distance = Math.sqrt(
//           Math.pow(particle.x - entity.x, 2) + Math.pow(particle.y - entity.y, 2)
//         );
//         if (distance < 1 || distance > 300) return;
//         if (distance < 10) particle.opacity = 0;
//         particle.setGravityAccel(entity.x, entity.y, entity.magnitude);
//       }
//       if (entity instanceof GameTimeZone) {
//         const distance = Math.sqrt(
//           Math.pow(particle.x - entity.x, 2) + Math.pow(particle.y - entity.y, 2)
//         );
//         if (distance < 1 || distance > entity.w / 2) return;
//         finalTimeFactor *= entity.timeFactor;
//       }
//     });
//     gameData.applGlobalEffectToParticle(particle);
//     particle.update(finalTimeFactor, gameData.globalGravityX, gameData.globalGravityY);
//   });
//   trailParticles(newParticles, newPosition);
//   if (particleCycle === gameData.tickPerParticlesSpawn) particleCycle = 0;
//   else particleCycle++;
//   if (particleCycle !== 0) return newParticles;
//   // add particles functions
//   trailingSpit(newParticles, newPosition, newPongSpeed);
//   if (pongSpeedMagnitude > 1) {
//     spit1(newParticles, newPosition, newPongSpeed);
//     spit2(newParticles, newPosition, newPongSpeed);
//   }

//   blackholeParticle(gameData, newParticles);

//   return newParticles;
// }

// function trailParticles(newParticles: GameParticle[], newPosition: Offset) {
//   newParticles.push(
//     new GameParticle({
//       x: newPosition.x,
//       y: newPosition.y,
//       opacity: 1,
//       vx: 0.12,
//       vy: 0.12,
//       opacityDecay: 0.03,
//       sizeDecay: 0.3,
//       w: 10,
//       h: 10,
//       colorIndex: 0,
//       affectedByGravity: false,
//     })
//   );
// }

// function blackholeParticle(gameData: GameData, newParticles: GameParticle[]) {
//   gameData.gameEntities.forEach((entity) => {
//     if (entity.type !== "blackhole") return;
//     const x = entity.x +
//       (Math.random() > 0.2 ? 1 : -1) * 30 +
//       30 * (Math.random() - 0.5);
//     const y = entity.y +
//       (Math.random() > 0.5 ? -1 : -1) * 30 +
//       30 * (Math.random() - 0.5);
//     const size = 2 + 8 * Math.random();
//     newParticles.push(
//       new GameParticle({
//         x: x,
//         y: y,
//         opacity: 1,
//         vx: (entity.x - x) / 10 + 7 + 2,
//         vy: (y - entity.y) / 10 + (Math.random() > 0.5 ? 1 : -1) + 5,
//         opacityDecay: 0.005,
//         w: size,
//         h: size,
//         colorIndex: 2,
//       })
//     );
//   });
// }

// function spit2(newParticles: GameParticle[], newPosition: Offset, newPongSpeed: Offset) {
//   for (let i = 0; i < 2; i++) {
//     const size = 6 + 4 * Math.random();
//     newParticles.push(
//       new GameParticle({
//         x: newPosition.x + 5 - 10 / 2,
//         y: newPosition.y + 5 - 10 / 2,
//         opacity: 1,
//         opacityDecay: 0.02,
//         vx: newPongSpeed.x * 1.5 + (Math.random() - 0.5) * 3,
//         vy: newPongSpeed.y * 1.5 + (Math.random() - 0.5) * 3,
//         w: size,
//         h: size,
//         speedDecayFactor: 0.95,
//         colorIndex: 1,
//         affectedByTimeZone: false,
//       })
//     );
//   }
// }

// function spit1(newParticles: GameParticle[], newPosition: Offset, newPongSpeed: Offset) {
//   for (let i = 0; i < 2; i++) {
//     const size = 2 + 3 * Math.random();
//     newParticles.push(
//       new GameParticle({
//         x: newPosition.x + 5 - 10 / 2,
//         y: newPosition.y + 5 - 10 / 2,
//         opacity: 0.8,
//         opacityDecay: 0.02,
//         vx: newPongSpeed.x * 1.5 + (Math.random() - 0.5) * 3,
//         vy: newPongSpeed.y * 1.5 + (Math.random() - 0.5) * 3,
//         w: size,
//         h: size,
//         speedDecayFactor: 0.95,
//         affectedByTimeZone: false,
//       })
//     );
//   }
// }

// function trailingSpit(newParticles: GameParticle[], newPosition: Offset, newPongSpeed: Offset) {
//   newParticles.push(
//     new GameParticle({
//       x: newPosition.x - 5 + 20 * Math.random(),
//       y: newPosition.y - 5 + 20 * Math.random(),
//       opacity: 1,
//       opacityDecay: 0.02,
//       vx: newPongSpeed.y * (Math.random() - 0.5) * 0.3,
//       vy: newPongSpeed.x * (Math.random() - 0.5) * 0.3,
//       w: 3,
//       h: 3,
//     })
//   );
// }