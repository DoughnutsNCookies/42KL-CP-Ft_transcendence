import * as PIXI from 'pixi.js';
import { Container, Graphics, ParticleContainer, PixiComponent, Sprite, useApp, useTick } from '@pixi/react'
import GameParticle, { GameLightningParticle } from '../../model/GameParticle';
import { Ref, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { GameDataCtx } from '../../GameApp';
import { GameBlackhole } from '../../model/GameEntities';
import Worker from '../../workers/gameGraphic.worker?worker'
import { BloomFilter, DropShadowFilter } from 'pixi-filters';
import { filter } from 'lodash';
import { GameGravityArrow } from '../../model/GameGravityArrow';
import GameParticleDelegate from '../../model/GameParticleDelegate';
import { PaddleType } from '../gameData';
import { Offset } from '../../model/GameModels';

// const gameGraphicWorker = new Worker();

interface ParticlesRendererProps {
  gameGravityArrow: GameGravityArrow | null;
}
function ParticlesRenderer(props: ParticlesRendererProps) {
  const { gameGravityArrow } = props;
  const app = useApp();
  const gameData = useContext(GameDataCtx);
  const [leftLightningParticles, setLeftLightningParticles] = useState<GameLightningParticle>();
  const [rightLightningParticles, setRightLightningParticles] = useState<GameLightningParticle>();

  const textures = useMemo(() => {
    const box = new PIXI.Graphics();
    drawWhiteParticleTexture(box);
    const white = app.renderer.generateTexture(box);
    drawCyanParticleTexture(box);
    const cyan = app.renderer.generateTexture(box);
    drawPurpleParticleTexture(box);
    const purple = app.renderer.generateTexture(box);
    drawLightingParticleTexture(box);
    const lightning = app.renderer.generateTexture(box);
    drawRedParticleTexture(box);
    const red = app.renderer.generateTexture(box);
    box.destroy();
    return [white, cyan, purple, lightning, red];
  }, []);

  const arrowTexture = useMemo(() => {
    if (!gameGravityArrow) return null;
    const box = new PIXI.Graphics();
    drawArrowParticleTexture(box, gameGravityArrow);
    const arrow = app.renderer.generateTexture(box);
    box.destroy();
    return arrow;
  }, [gameGravityArrow]);

  const bloomFilter = useMemo(() => {
    const bloomFilter = new BloomFilter();
    bloomFilter.blur = 3;
    return bloomFilter;
  }, []);

  const gameParticleDelegate = useMemo(() => {
    return new GameParticleDelegate(gameData);
  }, []);


  const trailContainerRef = useRef<PIXI.ParticleContainer>(null);
  const trailRedContainerRef = useRef<PIXI.ParticleContainer>(null);
  const trailCyanContainerRef = useRef<PIXI.ParticleContainer>(null);
  const trailPurpleContainerRef = useRef<PIXI.ParticleContainer>(null);
  const whiteContainerRef = useRef<PIXI.ParticleContainer>(null);
  const cyanContainerRef = useRef<PIXI.ParticleContainer>(null);
  const redContainerRef = useRef<PIXI.ParticleContainer>(null);
  const purpleContainerRef = useRef<PIXI.ParticleContainer>(null);
  const lightningContainerRef = useRef<PIXI.ParticleContainer>(null);
  const arrowContainerRef = useRef<PIXI.ParticleContainer>(null);

  useEffect(() => {
    gameData.ballHitParticle = ballHit;
    gameData.paddleHitParticle = paddleHit;
  }, []);

  useEffect(() => {
    if (!gameGravityArrow) {
      arrowContainerRef.current?.removeChildren();
    }
  }, [gameGravityArrow]);

  useTick((delta) => {
    const newPosition = gameData.pongPosition;
    if (newPosition.x <= 0)
      gameParticleDelegate.particles.forEach((p) => {
        p.ax = 1 + Math.random() * 3;
        p.vy = (Math.random() - 0.5) * 50;
        p.vx = 2;
        p.sizeDecayFactor = 1.03;
        p.opacityDecay = 0.015;
      });
    else if (newPosition.x >= 1600 - 10)
      gameParticleDelegate.particles.forEach((p) => {
        p.ax = -1 - Math.random() * 3;
        p.vy = (Math.random() - 0.5) * 50;
        p.vx = -2;
        p.sizeDecayFactor = 1.03;
        p.opacityDecay = 0.015;
      });
    if (gameData.leftPaddleType === PaddleType.Vzzzzzzt) {
      if (leftLightningParticles) {
        leftLightningParticles.centerX = gameData.leftPaddlePosition.x + 7.5;
        leftLightningParticles.centerY = gameData.leftPaddlePosition.y;
        leftLightningParticles.update(addLightningParticle, removeLightningParticle);
      } else {
        setLeftLightningParticles(new GameLightningParticle({
          centerX: 30,
          centerY: 450,
          paddingX: 15,
          paddingY: 60,
        }),);
      }
    }
    if (gameData.rightPaddleType === PaddleType.Vzzzzzzt) {
      if (rightLightningParticles) {
        rightLightningParticles.centerX = gameData.rightPaddlePosition.x + 7.5;
        rightLightningParticles.centerY = gameData.rightPaddlePosition.y;
        rightLightningParticles.update(addLightningParticle, removeLightningParticle);
      } else {
        setRightLightningParticles(new GameLightningParticle({
          centerX: 1570,
          centerY: 450,
          paddingX: 15,
          paddingY: 60,
        }),);
      }
    }
    gameParticleDelegate.update(addParticle, removeParticle, delta);
    gameGravityArrow?.update(addArrowParticle, removeArrowParticle, delta);
  });

  // const trailElementsRef = useRef<JSX.Element[]>([]);
  // const whiteElementsRef = useRef<JSX.Element[]>([]);
  // const cyanElementsRef = useRef<JSX.Element[]>([]);
  // const purpleElementsRef = useRef<JSX.Element[]>([]);
  // const lightningElementsRef = useRef<JSX.Element[]>([]);
  // const arrowElementsRef = useRef<JSX.Element[]>([]);
  // useEffect(() => {
  //   const trailElements: JSX.Element[] = trailElementsRef.current;
  //   const whiteElements: JSX.Element[] = whiteElementsRef.current;
  //   const cyanElements: JSX.Element[] = cyanElementsRef.current;
  //   const purpleElements: JSX.Element[] = purpleElementsRef.current;
  // const lightningElements: JSX.Element[] = lightningElementsRef.current;
  // const arrowElements: JSX.Element[] = arrowElementsRef.current;
  //   trailElements.length = 0;
  //   whiteElements.length = 0;
  //   cyanElements.length = 0;
  //   purpleElements.length = 0;
  // lightningElements.length = 0;
  // arrowElements.length = 0;

  //   particles.forEach((p) => {
  //     const { id, x, y, w, h, opacity, colorIndex, gravity } = p;
  //     if (colorIndex === 0 && gravity) {
  //       whiteElements.push(<Sprite key={id} x={x} y={y} width={w} height={h} alpha={opacity} texture={textures[colorIndex]} />);
  //     } else if (colorIndex === 1) {
  //       cyanElements.push(<Sprite key={id} x={x} y={y} width={w} height={h} alpha={opacity} texture={textures[colorIndex]} />);
  //     } else if (!gravity) {
  //       trailElements.push(<Sprite key={id} x={x} y={y} width={w} height={h} alpha={opacity} texture={textures[colorIndex]} />);
  //     } else {
  //       purpleElements.push(<Sprite key={id} x={x} y={y} width={w} height={h} alpha={opacity} texture={textures[colorIndex]} />);
  //     }
  //   });
  // lightningParticles.forEach((lightning) => {
  //   lightning.particles.forEach((p) => {
  //     const { id, x, y, w, h, colorIndex, rotRad, opacity } = p;
  //     lightningElements.push(<Sprite key={id} x={x} y={y} width={w} height={h} anchor={new PIXI.Point(0.5, 0)} rotation={rotRad} alpha={h > 5 ? opacity : 0} texture={textures[colorIndex]} />);
  //   });
  // });
  // if (!gameGravityArrow || !arrowTexture) return;
  // gameGravityArrow.arrowsParticles.forEach((p) => {
  //   const { id, x, y, w, h, rotRad } = p;
  //   arrowElements.push(<Sprite key={id} x={x} y={y} width={w} height={h} rotation={rotRad} alpha={0.2} texture={arrowTexture} />);
  // });
  // }, [particles, lightningParticles]);

  return (
    <Container
      interactiveChildren={false}
      filterArea={gameData.particlesFilter ? new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height) : null as unknown as undefined}
      filters={gameData.particlesFilter ? [bloomFilter] : null as unknown as undefined}
    >
      <ParticleContainer
        ref={arrowContainerRef}
        key={"arrowParticles"}
        properties={{ position: true, scale: true, alpha: true }}
      />
      <ParticleContainer
        ref={trailContainerRef}
        key={"trailParticles"}
        properties={{ position: true, scale: true, alpha: true }}
      />
      <ParticleContainer
        ref={trailRedContainerRef}
        key={"trailParticlesRed"}
        properties={{ position: true, scale: true, alpha: true }}
      />
      <ParticleContainer
        ref={trailCyanContainerRef}
        key={"trailParticlesCyan"}
        properties={{ position: true, scale: true, alpha: true }}
      />
      <ParticleContainer
        ref={trailPurpleContainerRef}
        key={"trailParticlesPurple"}
        properties={{ position: true, scale: true, alpha: true }}
      />
      <ParticleContainer
        ref={cyanContainerRef}
        key={"cyanParticles"}
        properties={{ position: true, alpha: true }}
      />
      <ParticleContainer
        ref={redContainerRef}
        key={"redParticles"}
        properties={{ position: true, alpha: true }}
      />
      <ParticleContainer
        ref={whiteContainerRef}
        key={"whiteParticles"}
        properties={{ position: true, alpha: true }}
      />
      <ParticleContainer
        ref={purpleContainerRef}
        key={"purpleParticles"}
        properties={{ position: true, alpha: true }}
      />
      <ParticleContainer
        ref={lightningContainerRef}
        key={"lightningParticles"}
        properties={{ position: true, scale: true, alpha: true, rotation: true }}
      />
    </Container>
  )

  function addLightningParticle(particle: GameParticle) {
    const { x, y, w, h, rotRad, colorIndex, opacity } = particle;
    const sprite = new PIXI.Sprite(textures[colorIndex]);
    sprite.x = x;
    sprite.y = y;
    sprite.width = w;
    sprite.height = h;
    sprite.anchor.set(0.5, 0);
    sprite.rotation = rotRad;
    sprite.alpha = opacity;
    lightningContainerRef.current?.addChild(sprite);
    particle.sprite = sprite;
  }

  function removeLightningParticle(particle: GameParticle) {
    const { sprite: ref } = particle;
    if (!ref) return;
    lightningContainerRef.current?.removeChild(ref);
  }

  function addArrowParticle(particle: GameParticle) {
    const { x, y, w, h, rotRad } = particle;
    const sprite = new PIXI.Sprite(arrowTexture!);
    sprite.x = x;
    sprite.y = y;
    sprite.width = w;
    sprite.height = h;
    sprite.alpha = 0.2;
    sprite.rotation = rotRad;
    arrowContainerRef.current?.addChild(sprite);
    particle.sprite = sprite;
  }

  function removeArrowParticle(particle: GameParticle) {
    const { sprite: ref } = particle;
    if (!ref) return;
    arrowContainerRef.current?.removeChild(ref);
  }

  function addParticle(particle: GameParticle) {
    const { x, y, w, h, opacity, colorIndex, affectedByGravity } = particle;
    const sprite = new PIXI.Sprite(textures[colorIndex]);
    sprite.x = x;
    sprite.y = y;
    sprite.width = w;
    sprite.height = h;
    sprite.alpha = opacity;
    particle.sprite = sprite;
    if (colorIndex === 0 && affectedByGravity) {
      whiteContainerRef.current?.addChild(sprite);
    } else if (colorIndex === 1 && !affectedByGravity) {
      trailCyanContainerRef.current?.addChild(sprite);
    } else if (colorIndex === 1) {
      cyanContainerRef.current?.addChild(sprite);
    } else if (colorIndex === 4 && !affectedByGravity) {
      trailRedContainerRef.current?.addChild(sprite);
    } else if (colorIndex === 4) {
      redContainerRef.current?.addChild(sprite);
    } else if (colorIndex === 2 && !affectedByGravity) {
      trailPurpleContainerRef.current?.addChild(sprite);
    } else if (!affectedByGravity) {
      trailContainerRef.current?.addChild(sprite);
    } else {
      purpleContainerRef.current?.addChild(sprite);
    }
  }

  function removeParticle(particle: GameParticle) {
    const { colorIndex, affectedByGravity, sprite: ref } = particle;
    if (!ref) return;
    let sprite: PIXI.Sprite | undefined;
    if (colorIndex === 0 && affectedByGravity && whiteContainerRef.current) {
      sprite = whiteContainerRef.current.removeChildAt(whiteContainerRef.current.getChildIndex(ref));
    } else if (colorIndex === 1 && !affectedByGravity && trailCyanContainerRef.current) {
      sprite = trailCyanContainerRef.current.removeChildAt(trailCyanContainerRef.current.getChildIndex(ref));
    } else if (colorIndex === 1 && cyanContainerRef.current) {
      sprite = cyanContainerRef.current.removeChildAt(cyanContainerRef.current.getChildIndex(ref));
    } else if (colorIndex === 4 && trailRedContainerRef.current && !affectedByGravity) {
      sprite = trailRedContainerRef.current.removeChildAt(trailRedContainerRef.current.getChildIndex(ref));
    } else if (colorIndex === 4 && redContainerRef.current) {
      sprite = redContainerRef.current.removeChildAt(redContainerRef.current.getChildIndex(ref));
    } else if (colorIndex === 2 && !affectedByGravity && trailPurpleContainerRef.current) {
      sprite = trailPurpleContainerRef.current.removeChildAt(trailPurpleContainerRef.current.getChildIndex(ref));
    } else if (!affectedByGravity && trailContainerRef.current) {
      sprite = trailContainerRef.current.removeChildAt(trailContainerRef.current.getChildIndex(ref));
    } else if (purpleContainerRef.current) {
      sprite = purpleContainerRef.current.removeChildAt(purpleContainerRef.current.getChildIndex(ref));
    }
    if (sprite) {
      sprite.destroy();
    }
  }

  function ballHit() {
    gameParticleDelegate.ballHitParticle(addParticle);
  }

  function paddleHit() {
    gameParticleDelegate.paddleHitParticle(addParticle);
  }
}

export default ParticlesRenderer

function drawWhiteParticleTexture(box: PIXI.Graphics) {
  box.beginFill(0xFEF8E2, 0.8);
  box.drawRect(0, 0, 2, 2);
  box.endFill();
}

function drawPurpleParticleTexture(box: PIXI.Graphics) {
  box.clear();
  box.beginFill(0xC5A1FF, 0.6);
  box.drawRect(0, 0, 2, 2);
  box.endFill();
}

function drawCyanParticleTexture(box: PIXI.Graphics) {
  box.clear();
  box.beginFill(0x5F928F, 0.8);
  box.drawRect(0, 0, 2, 2);
  box.endFill();
}

function drawRedParticleTexture(box: PIXI.Graphics) {
  box.clear();
  box.beginFill(0xAD6454, 0.8);
  box.drawRect(0, 0, 2, 2);
  box.endFill();
}

function drawLightingParticleTexture(box: PIXI.Graphics) {
  box.clear();
  box.lineStyle(6, 0x5F928F);
  box.moveTo(-2, 0);
  box.lineTo(4, 20);
  box.lineTo(-8, 30);
  box.lineTo(2, 46);
  box.lineTo(-2, 60);
  box.lineStyle(6, 0x5F928F);
  box.moveTo(2, 0);
  box.lineTo(8, 20);
  box.lineTo(-4, 30);
  box.lineTo(6, 46);
  box.lineTo(2, 60);
  box.lineStyle(4, 0xffffff, 0.5);
  box.moveTo(0, 0);
  box.lineTo(6, 20);
  box.lineTo(-6, 30);
  box.lineTo(4, 46);
  box.lineTo(0, 60);
}

function drawArrowParticleTexture(box: PIXI.Graphics, gameGravityArrow: GameGravityArrow) {
  box.clear();
  box.lineStyle({ cap: PIXI.LINE_CAP.ROUND, width: 10, color: gameGravityArrow.color, alpha: 1 })
  if (gameGravityArrow.isUp) {
    box.moveTo(0, 0);
    box.lineTo(20, 20);
    box.moveTo(0, 0);
    box.lineTo(-20, 20);
    box.moveTo(0, 0);
    box.lineTo(0, 100);
  } else {
    box.moveTo(0, 0);
    box.lineTo(20, -20);
    box.moveTo(0, 0);
    box.lineTo(-20, -20);
    box.moveTo(0, 0);
    box.lineTo(0, -100);
  }
  box.endFill();
}