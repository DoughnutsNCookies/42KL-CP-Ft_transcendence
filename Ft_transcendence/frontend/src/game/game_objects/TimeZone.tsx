import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Container, Graphics, ParticleContainer, PixiComponent, Sprite, useApp, useTick } from '@pixi/react'
import { BoxSize, Offset } from '../../model/GameModels';
import * as PIXI from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import { GameDataCtx } from '../../GameApp';
import wheelChairMove from '../../../assets/icons/wheelchair-move-solid.svg';
import wheelChair from '../../../assets/icons/wheelchair-solid.svg';


export enum TimeZoneType {
  SPEEDUP,
  SLOWDOWN,
}

interface TimeZoneProps {
  position: Offset
  size: BoxSize;
  type: TimeZoneType;
}

const svgSizeRatio = 0.5;

function TimeZone(props: TimeZoneProps) {
  const { position, size, type } = props;
  const app = useApp();
  const gameData = useContext(GameDataCtx);

  const color = useMemo(() => {
    switch (type) {
      case TimeZoneType.SPEEDUP:
        return 0x5F928F;
      case TimeZoneType.SLOWDOWN:
        return 0xAD6454;
      default:
        return 0x5F928F;
    }
  }, [type]);

  const texture = useMemo(() => {
    const box = new PIXI.Graphics();
    box.beginFill(color, 0.2);
    box.lineStyle(12, color, 1);
    box.drawCircle(0, 0, size.w / 2);
    box.endFill();
    const texture = app.renderer.generateTexture(box);
    box.destroy();
    return texture;
  }, [size.w, size.h, type]);

  const iconTexture = useMemo(() => {
    switch (type) {
      case TimeZoneType.SPEEDUP:
        return PIXI.Texture.from(wheelChairMove);
      case TimeZoneType.SLOWDOWN:
        return PIXI.Texture.from(wheelChair);
      default:
        return PIXI.Texture.from(wheelChairMove);
    }
  }, [type]);

  const filter = useMemo(() => {
    const dropShadowFilter = new DropShadowFilter();
    dropShadowFilter.color = color;
    dropShadowFilter.alpha = 0.8;
    dropShadowFilter.blur = 3;
    dropShadowFilter.offset = new PIXI.Point(0, 0);
    dropShadowFilter.padding = 40;
    dropShadowFilter.quality = 5;
    return dropShadowFilter;
  }, [type]);

  const ref = useRef<PIXI.Container>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ticker = app.ticker;
    ref.current!.alpha = 0;

    const tick = () => {
      ref.current!.alpha += 0.02;
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
    <Container x={position.x} y={position.y} ref={ref}>
      <Sprite
        anchor={0.5}
        width={size.w}
        height={size.h}
        texture={texture}
        alpha={0.4}
        filters={gameData.entitiesFilter ? [filter] : null as unknown as undefined}
      />
      <Sprite
        anchor={0.5}
        width={size.w * svgSizeRatio}
        height={size.h * svgSizeRatio}
        texture={iconTexture}
        alpha={0.4}
        filters={gameData.entitiesFilter ? [filter] : null as unknown as undefined}
      />
    </Container>
  )
}

export default TimeZone