import React, { useContext, useEffect, useMemo, useRef } from 'react'
import * as PIXI from 'pixi.js';
import { Container, Sprite, useApp, useTick } from '@pixi/react';
import { DropShadowFilter } from 'pixi-filters';
import { GameDataCtx } from '../../GameApp';

interface BlockProps {
  x: number;
  y: number;
  w: number;
  h: number;
}

function Block(props: BlockProps) {
  const { x, y, w, h } = props;
  const app = useApp();
  const gameData = useContext(GameDataCtx);

  const texture = useMemo(() => {
    const box = new PIXI.Graphics();
    box.beginFill(0xFEF8E2, 1);
    box.drawRoundedRect(0, 0, 200, 200, 30);
    box.endFill();
    const texture = app.renderer.generateTexture(box);
    box.destroy();
    return texture;
  }, []);

  const filter = useMemo(() => {
    const dropShadowFilter = new DropShadowFilter();
    dropShadowFilter.color = 0xFEF8E2;
    dropShadowFilter.alpha = 0.7;
    dropShadowFilter.blur = 4.5;
    dropShadowFilter.offset = new PIXI.Point(0, 0);
    dropShadowFilter.padding = 40;
    dropShadowFilter.quality = 5;
    return dropShadowFilter;
  }, []);

  const ref = useRef<PIXI.Sprite>(null);

  useTick(() => {
    if (!ref.current) return;
    const { x, y } = gameData.blockPosition
    ref.current.x = x;
    ref.current.y = y;
  });

  useEffect(() => {
    if (!ref.current) return;
    const ticker = app.ticker;
    ref.current!.alpha = 0;
    filter.alpha = 0;
    const tick = () => {
      ref.current!.alpha += 0.02;
      if (filter.alpha < 0.7) filter.alpha += 0.02;
      if (ref.current!.alpha >= 1) {
        ticker.remove(tick);
      }
    };
    ticker.add(tick);

    return () => {
      ticker.remove(tick);
      ref.current?.destroy();
    };
  }, []);


  return (
    <Sprite ref={ref} anchor={0.5} x={x} y={y} width={w} height={h} texture={texture}
      filters={gameData.entitiesFilter ? [filter] : null as unknown as undefined}
    />
  )
}

export default Block