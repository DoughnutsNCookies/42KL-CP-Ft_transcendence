import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Container, Graphics, Sprite, useApp, useTick } from '@pixi/react'
import { BoxSize, Offset } from '../../model/GameModels';
import * as PIXI from 'pixi.js';
import { GameDataCtx } from '../../GameApp';
import { DropShadowFilter } from 'pixi-filters';
import { PaddleType } from '../gameData';

const arrowTickSkip = 14;

function Arrow() {
  const gameData = useContext(GameDataCtx);
  const ref = useRef<PIXI.Container>(null);
  const tickRef = useRef<number>(0);
  const arrowRef = useRef<PIXI.Sprite | null>(null);
  const dashRef = useRef<PIXI.Sprite[]>([]);
  const app = useApp();

  const { arrowTexture, dashTexture } = useMemo(() => {
    const g = new PIXI.Graphics();
    g.lineStyle({ cap: PIXI.LINE_CAP.ROUND, width: 3, color: 0xFEF8E2, alpha: 1 });
    g.moveTo(0, 0);
    g.lineTo(0, 13);
    const dashTexture = app.renderer.generateTexture(g);
    g.moveTo(0, 0);
    g.lineTo(5, 5);
    g.moveTo(0, 0);
    g.lineTo(-5, 5);
    const arrowTexture = app.renderer.generateTexture(g);
    g.destroy();
    return { arrowTexture, dashTexture };
  }, []);

  useEffect(() => {
    arrowRef.current = new PIXI.Sprite(arrowTexture);
    for (let i = 0; i < 5; i++) {
      dashRef.current.push(new PIXI.Sprite(dashTexture));
    }
    ref.current?.addChild(arrowRef.current);
    dashRef.current.forEach((dash, index) => {
      dash.anchor.set(0.5, 0.5);
      ref.current?.addChild(dash);
      dash.alpha = Math.max(1 - index * 0.3, 0);
    });
    arrowRef.current.anchor.set(0.5, 0.5);
  }, []);

  useTick((delta) => {
    if (ref.current == null || arrowRef.current == null) return;
    if (!gameData.attracted) {
      ref.current.x = -1000;
      ref.current.y = -1000;
      return;
    }
    const container = ref.current;
    container.x = gameData.pongPosition.x + 7;
    container.y = gameData.pongPosition.y + 7;
    const { x, y } = gameData.mousePosition;
    const angle = Math.atan2(y - container.y, x - container.x) + Math.PI / 2;
    container.rotation = angle;
    if (tickRef.current++ % arrowTickSkip !== 0) return;
    const arrow = arrowRef.current;
    arrow.y -= 25;
    if (arrow.y < -125) {
      arrow.y = 0;
      dashRef.current.forEach((dash, i) => { dash.y = 0; });
    }
    else
      dashRef.current.forEach((dash, i) => {
        if (i === 0) dash.y = arrow.y + 25;
        else dash.y = Math.min(dashRef.current[i - 1].y + 25, 0);
      });

  });

  return (
    <Container ref={ref} x={-100} y={-100} alpha={0.2} />
  )
}

interface PaddleProps {
  left: boolean;
}

function Paddle(props: PaddleProps) {
  const { left } = props;
  const app = useApp();
  const gameData = useContext(GameDataCtx);
  const rotRef = useRef<number>(0);
  const paddleRef = useRef<PIXI.Sprite>(null);
  const [type, setType] = useState<PaddleType>(PaddleType.Vzzzzzzt);

  const size: BoxSize = useMemo(() => {
    if (type === PaddleType.Ngeeeaat) {
      return { w: 15, h: 150 };
    }
    return { w: 15, h: 100 };
  }, [type]);

  useTick((delta) => {
    if (paddleRef.current == null) return;
    if (type !== PaddleType.Piiuuuuu) return;
    if (!gameData.attracted) { paddleRef.current.rotation = 0; rotRef.current = 0; return; }
    if (!left && gameData.pongPosition.x < gameData.gameCurrentWidth / 2) { paddleRef.current.rotation = 0; rotRef.current = 0; return; }
    if (left && gameData.pongPosition.x > gameData.gameCurrentWidth / 2) { paddleRef.current.rotation = 0; rotRef.current = 0; return; }
    paddleRef.current.rotation = Math.sin(rotRef.current) * 0.05;
    rotRef.current += 0.8 * delta;
  });

  useTick((delta) => {
    if (paddleRef.current == null) return;
    const paddle = paddleRef.current;
    let position: Offset;
    if (left) {
      position = gameData.leftPaddlePosition;
      if (gameData.leftPaddleType !== type) {
        setType(gameData.leftPaddleType);
      }
    } else {
      position = gameData.rightPaddlePosition;
      if (gameData.rightPaddleType !== type) {
        setType(gameData.rightPaddleType);
      }
    }
    paddle.x = position.x + size.w / 2;
    paddle.y = position.y;
  }, true);

  const texture = useMemo(() => {
    const g = new PIXI.Graphics();
    const t1 = new PIXI.Text();
    const t2 = new PIXI.Text();
    g.beginFill(0xFEF8E2);
    g.drawRect(0, 0, size.w, size.h);
    g.endFill();
    switch (type) {
      case PaddleType.Vzzzzzzt:
        break;
      case PaddleType.Piiuuuuu:
        g.beginFill(0xAD6454);
        g.drawRect(0, 0, size.w, 30);
        g.endFill();

        g.beginFill(0x5F928F);
        g.drawRect(0, size.h - 30, size.w, 30);
        g.endFill();

        t1.text = "M";
        t1.style = new PIXI.TextStyle({
          fontFamily: "JetBrains Mono",
          fontSize: 13,
          fill: 0xFEF8E2,
        });
        t1.x = 9;
        t1.y = 10;
        t1.rotation = -Math.PI / 2;
        t1.anchor.set(0.5, 0.5);

        t2.text = "S";
        t2.style = new PIXI.TextStyle({
          fontFamily: "JetBrains Mono",
          fontSize: 13,
          fill: 0xFEF8E2,
        });
        t2.x = 9;
        t2.y = size.h - 10;
        t2.rotation = -Math.PI / 2;
        t2.anchor.set(0.5, 0.5);

        g.addChild(t1);
        g.addChild(t2);
        break;
      case PaddleType.Ngeeeaat:
        g.clear();
        g.beginFill(0xFEF8E2);
        g.moveTo(0, 0);
        g.bezierCurveTo(10, size.h, 10, size.h, 0, size.h * 2);
        g.lineTo(size.w * 2, size.h * 2);
        g.bezierCurveTo(size.w * 2 - 10, size.h, size.w * 2 - 10, size.h, size.w * 2, 0);
        g.closePath();
        g.endFill();
        break;
      case PaddleType.Vrooooom:
        g.beginFill(0xAD6454);
        if (!left) g.drawRect(0, 0, 7, size.h);
        else g.drawRect(8, 0, size.w - 8, size.h);
        g.endFill();
        break;
      default:
        break;
    }
    const texture = app.renderer.generateTexture(g);
    t1.destroy();
    t2.destroy();
    g.destroy();
    return texture;
  }, [type]);

  const filter = useMemo(() => {
    const dropShadowFilter = new DropShadowFilter();
    dropShadowFilter.color = 0xFEF8E2;
    dropShadowFilter.alpha = 0.5;
    dropShadowFilter.blur = 3;
    dropShadowFilter.offset = new PIXI.Point(0, 0);
    dropShadowFilter.padding = 40;
    dropShadowFilter.quality = 4;
    return dropShadowFilter;
  }, []);

  return (
    <>
      <Sprite
        ref={paddleRef}
        texture={texture}
        width={size.w}
        height={size.h}
        anchor={new PIXI.Point(0.5, 0.5)}
        filters={gameData.paddleFilter && gameData.gameType !== "boring" ? [filter] : null as unknown as undefined}
      />
      <Arrow />
    </>
  )
}

export default Paddle