import { Sprite, Text, useApp } from '@pixi/react'
import React, { useMemo } from 'react'
import * as PIXI from 'pixi.js';
import { Offset } from '../../model/GameModels';
import { DropShadowFilter } from 'pixi-filters';

interface GameTextProps {
  textRef?: React.RefObject<PIXI.Sprite>;
  position?: Offset;
  text?: string;
  fontSize?: number;
  color?: number;
  opacity?: number;
  anchor?: number | PIXI.Point;
  fontWeight?: PIXI.TextStyleFontWeight;
}

function GameText(props: GameTextProps) {
  const { textRef, fontWeight, position, text = "", fontSize = 16, color = 0xFEF8E2, opacity = 1, anchor = 0 } = props;
  const app = useApp();
  const texture = useMemo(() => {
    const textGraphic = new PIXI.Text(text, new PIXI.TextStyle({
      fontFamily: 'JetBrains Mono',
      fontSize: fontSize,
      fill: '#ffffff',
      letterSpacing: -20,
      fontWeight: fontWeight ?? 'normal',
    }));
    const box = new PIXI.Graphics();
    box.beginFill(color, opacity);
    box.drawRect(0, 0, textGraphic.width, textGraphic.height);
    box.endFill();

    box.mask = textGraphic;
    const texture = app.renderer.generateTexture(box);
    box.destroy();
    return texture;
  }, [text, fontSize, color, opacity, fontWeight]);


  const filter = useMemo(() => {
    const dropShadowFilter = new DropShadowFilter();
    dropShadowFilter.color = 0xFEF8E2;
    dropShadowFilter.alpha = 0.8;
    dropShadowFilter.blur = 3;
    dropShadowFilter.offset = new PIXI.Point(0, 0);
    dropShadowFilter.padding = 40;
    dropShadowFilter.quality = 5;
    return dropShadowFilter;
  }, []);
  return (
    <Sprite ref={textRef} anchor={anchor} x={position ? position.x : undefined} y={position ? position.y : undefined} texture={texture}
    // filters={[filter]} 
    />
  )
}

export default GameText