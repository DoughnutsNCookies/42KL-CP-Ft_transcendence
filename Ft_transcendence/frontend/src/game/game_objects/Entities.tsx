import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { GameDataCtx } from '../../GameApp';
import GameEntity, { GameBlackhole, GameBlock, GameTimeZone } from '../../model/GameEntities';
import Blackhole from './Blackhole';
import TimeZone, { TimeZoneType } from './TimeZone';
import Block from './Block';
import { useTick } from '@pixi/react';

function Entities() {
  const gameData = useContext(GameDataCtx);
  const [entities, setEntities] = useState<GameEntity[]>([]);

  useEffect(() => {
    gameData.setEntities = setEntities;
  }, []);

  return (
    <>
      {getEntityElements()}
    </>
  )
  function getEntityElements() {
    return entities.map((entity, index) => {
      if (entity instanceof GameBlackhole) {
        const { x, y, w, h } = entity;
        return <Blackhole key={index} x={x} y={y} w={w} h={h} />
      }
      if (entity instanceof GameTimeZone) {
        const { x, y, w, h, timeFactor: speedFactor } = entity;
        return <TimeZone key={index} position={{ x, y }} size={{ w, h }} type={speedFactor > 1 ? TimeZoneType.SPEEDUP : TimeZoneType.SLOWDOWN} />
      }
      if (entity instanceof GameBlock) {
        const { x, y, w, h } = entity;
        return <Block key={index} x={x} y={y} w={w} h={h} />
      }
    });
  }
}

export default Entities