import React, { useCallback, useEffect, useState } from 'react'
import { Container, Graphics, ParticleContainer, PixiComponent, Sprite, useTick, withFilters, } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { BoxSize, Offset } from '../../model/GameModels';

export enum Mode {
  NORMAL,
  FAST,
}

interface CurvesProps {
  p1: Offset;
  p2: Offset;
  p3: Offset;
  p4: Offset;
}
const Curves = PixiComponent<CurvesProps, PIXI.Graphics>('Curves', {
  create: (props) => {
    return new PIXI.Graphics();
  },
  applyProps: (instance, _, props) => {
    const { p1, p2, p3, p4 } = props;
    instance.clear();
    instance.lineStyle(2, 0x5F928F, 0.5);
    instance.moveTo(p1.x, p1.y);
    instance.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
  }
});

interface PongEffectProps {
  position: Offset
  size: BoxSize;
  speed: Offset;
  mode: Mode;
}


function PongEffect(props: PongEffectProps) {
  const { position, size, speed, mode } = props;
  const [curves, setCurves] = useState<CurvesProps[]>([]);

  useEffect(() => {
    const newCurves: CurvesProps[] = [];
    if (mode === Mode.FAST) {

      for (let i = 0; i < 20; i++) {
        newCurves.push({
          p1: {
            x: position.x - 3 * speed.x + speed.x * Math.random(),
            y: position.y - 7 * speed.y + speed.y * Math.random()
          },
          p2: {
            x: position.x + 7 * speed.x,
            y: position.y + 5 * speed.y
          },
          p3: {
            x: position.x + 5 * speed.x,
            y: position.y + 7 * speed.y
          },
          p4: {
            x: position.x - 7 * speed.x + speed.x * Math.random(),
            y: position.y - 3 * speed.y + speed.y * Math.random()
          }
        });
      }
      setCurves(newCurves);
    }
  }, [speed.x, speed.y]);

  useTick((delta) => {

    setCurves((curves) => {
      const newCurves = [...curves];
      newCurves.forEach((curve) => {
        curve.p1.x += speed.x;
        curve.p1.y += speed.y;
        curve.p2.x += speed.x;
        curve.p2.y += speed.y;
        curve.p3.x += speed.x;
        curve.p3.y += speed.y;
        curve.p4.x += speed.x;
        curve.p4.y += speed.y;
      });
      return newCurves;
    });

  });


  const curvesComponents = curves.map((curve, index) => {
    return (<Curves key={index + position.x} p1={curve.p1} p2={curve.p2} p3={curve.p3} p4={curve.p4} />)
  });
  return (
    <>
      {curvesComponents}
    </>
  )
}

export default PongEffect