import React, { useCallback, useMemo } from 'react'
import * as PIXI from 'pixi.js';
import { Graphics, Sprite, useApp } from '@pixi/react';
import { Offset } from '../../model/GameModels';

declare module 'pixi.js' {
  export interface Graphics {
    drawDashLine(toX: number, toY: number, dash?: number, gap?: number): void;
  }
}

PIXI.Graphics.prototype.drawDashLine = function (toX, toY, dash = 16, gap = 8) {
  const lastPosition = this.currentPath.points;

  const currentPosition = {
    x: lastPosition[lastPosition.length - 2] || 0,
    y: lastPosition[lastPosition.length - 1] || 0
  };

  const absValues = {
    toX: Math.abs(toX),
    toY: Math.abs(toY)
  };

  for (
    ;
    Math.abs(currentPosition.x) < absValues.toX ||
    Math.abs(currentPosition.y) < absValues.toY;
  ) {
    currentPosition.x =
      Math.abs(currentPosition.x + dash) < absValues.toX
        ? currentPosition.x + dash
        : toX;
    currentPosition.y =
      Math.abs(currentPosition.y + dash) < absValues.toY
        ? currentPosition.y + dash
        : toY;

    this.lineTo(currentPosition.x, currentPosition.y);

    currentPosition.x =
      Math.abs(currentPosition.x + gap) < absValues.toX
        ? currentPosition.x + gap
        : toX;
    currentPosition.y =
      Math.abs(currentPosition.y + gap) < absValues.toY
        ? currentPosition.y + gap
        : toY;

    this.moveTo(currentPosition.x, currentPosition.y);
  }
};

interface DashLineProps {
  start: Offset;
  end: Offset;
  color?: number;
  dash?: number;
  gap?: number;
  thinkness?: number;
  opacity?: number;
}

function DashLine(props: DashLineProps) {
  const { start, end, color, dash, gap, thinkness, opacity } = props;
  const app = useApp();
  const texture = useMemo(() => {
    const g = new PIXI.Graphics();
    g.lineStyle(thinkness ?? 2, color ?? 0xffffff, opacity ?? 1);
    g.moveTo(start.x, start.y);
    g.drawDashLine(end.x, end.y, dash, gap);
    const texture = app.renderer.generateTexture(g);
    g.destroy();
    return texture;
  }, []);
  return (
    <Sprite
      x={Math.min(start.x, end.x)}
      y={Math.min(start.y, end.y)}
      width={Math.abs(start.x - end.x) + thinkness!}
      height={Math.abs(start.y - end.y) + thinkness!}
      texture={texture}
    />
  )
}

export default DashLine