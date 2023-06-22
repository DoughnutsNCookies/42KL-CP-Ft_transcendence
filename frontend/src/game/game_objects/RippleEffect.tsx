import React, { useCallback, useContext, useEffect, useState } from 'react'
import { BoxSize, Offset } from '../../model/GameModels';
import { Container, Graphics, PixiComponent, Sprite, useTick, withFilters, } from '@pixi/react';
import * as PIXI from 'pixi.js';
import sleep from '../../functions/sleep';
import { GameDataCtx } from '../../GameApp';


interface RingProps {
  position: Offset
  r: number;
  opacity: number;
}

const Ring = PixiComponent<RingProps, PIXI.Graphics>('RippleEffect', {
  create: (props) => {
    return new PIXI.Graphics();
  },
  applyProps: (instance, _, props) => {
    const { position, r, opacity } = props;

    instance.clear();
    instance.lineStyle(2, 0xFEF8E2, opacity);
    instance.drawCircle(position.x, position.y, r);
  },
});

export interface Ring {
  position: Offset
  r: number;
  opacity: number;
}

interface RippleEffectProps {
  rings: Ring[];
}

const blurFilter: PIXI.BlurFilter = new PIXI.BlurFilter(2);
const displacementFilter: PIXI.DisplacementFilter = new PIXI.DisplacementFilter(
  PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/pixi-filters/displacement_map_repeat.jpg'),
  100,
);

function RippleEffect(props: RippleEffectProps) {
  const { rings } = props;
  const ringComponentRef = React.useRef<JSX.Element[]>([]);
  useEffect(() => {
    const ringComponent = ringComponentRef.current;
    ringComponent.length = 0;
    rings.forEach((item, i) => {
      ringComponent.push(<Ring key={i} position={item.position} r={item.r} opacity={item.opacity} />)
    });
  }, [rings]);

  return (
    <Container filters={[blurFilter, displacementFilter]}>
      {ringComponentRef.current}
    </Container>
  )
}
export default RippleEffect