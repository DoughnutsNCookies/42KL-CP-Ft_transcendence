import { Container } from '@pixi/react'
import React, { useEffect, useRef, useState } from 'react'
import GameText from './GameText'
import * as PIXI from 'pixi.js';
import { Offset } from '../../model/GameModels';

interface GameEndTextProps {
  text?: string;
  winner?: boolean;
}

function GameEndText(props: GameEndTextProps) {
  const { text = '', winner } = props;
  const shadowRef = useRef<PIXI.Sprite>(null);
  const textRef = useRef<PIXI.Sprite>(null);
  const countRef = useRef(0);

  useEffect(() => {
    const ticker = new PIXI.Ticker();
    ticker.speed = 1;
    const tickerCallback = (delta: number) => {
      if (!shadowRef.current || !textRef.current) return;
      countRef.current += 1 * delta;
      ticker.speed -= 0.1 * delta;
      shadowRef.current.x = 800 + countRef.current;
      shadowRef.current.y = 450 + countRef.current;
      textRef.current.x = 800 - countRef.current;
      textRef.current.y = 450 - countRef.current;
      if (countRef.current > 10) {
        ticker.stop();
        ticker.remove(tickerCallback);
        ticker.destroy();
      }
    }
    ticker.add(tickerCallback);
    ticker.start();
  }, []);

  return (
    <>
      <GameText textRef={shadowRef} text={text} position={{ x: 0, y: 0 }} fontWeight={text.length > 10 ? '600' : '900'} fontSize={text.length > 10 ? 150 : 250} anchor={0.5} color={!winner ? 0xff0000 : 0x19A6FF} opacity={0.25} />
      <GameText textRef={textRef} text={text} position={{ x: 0, y: 0 }} fontWeight={text.length > 10 ? '600' : '900'} fontSize={text.length > 10 ? 150 : 250} anchor={0.5} />
    </>
  )
}

export default GameEndText