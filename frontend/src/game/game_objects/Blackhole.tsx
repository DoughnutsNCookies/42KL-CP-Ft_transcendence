import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as PIXI from 'pixi.js';
import { Sprite, useApp, useTick } from '@pixi/react';
import { GameDataCtx } from '../../GameApp';
import { DropShadowFilter, GlowFilter } from 'pixi-filters';

interface BlackholeProps {
  x: number;
  y: number;
  w: number;
  h: number;
}

function Blackhole(props: BlackholeProps) {
  const { x, y, w, h } = props;
  const app = useApp();
  const texture = useMemo(() => {
    const box = new PIXI.Graphics();

    box.beginFill(0x050505, 1);
    box.drawCircle(0, 0, 20);
    box.endFill();
    const texture = app.renderer.generateTexture(box);
    box.destroy();
    return texture;
  }, []);

  const filters = useMemo(() => {
    const glowFilter = new GlowFilter();
    glowFilter.color = 0x6B5B85;
    glowFilter.alpha = 0.8;
    glowFilter.outerStrength = 5;
    glowFilter.innerStrength = 5;
    glowFilter.padding = 40;
    const dropShadowFilter = new DropShadowFilter();
    dropShadowFilter.color = 0x6B5B85;
    dropShadowFilter.alpha = 1;
    dropShadowFilter.blur = 10;
    dropShadowFilter.offset = new PIXI.Point(0, 0);
    dropShadowFilter.padding = 40;
    dropShadowFilter.quality = 5;
    return [glowFilter, dropShadowFilter];
  }, []);

  const ref = useRef<PIXI.Sprite>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ticker = app.ticker;
    ref.current!.alpha = 0;
    filters.forEach(filter => {
      filter.alpha = 0;
    });
    const tick = () => {
      ref.current!.alpha += 0.02;
      filters.forEach(filter => {
        if (filter.alpha >= 0.8 && filter instanceof GlowFilter) return;
        if (filter.alpha >= 1) return;
        filter.alpha += 0.02;
      });
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
    <Sprite ref={ref} anchor={0.5} x={x} y={y} width={40} height={40} texture={texture}
      filters={filters}
    />
  )
}

export default Blackhole