import React, { useEffect } from 'react'
import { useState } from 'react';
import sleep from '../functions/sleep';

export enum CardType {
  SUCCESS,
  ERROR,
}

interface CardProps {
  type?: CardType;
  children: React.ReactNode;
}

interface CardAnimation {
  transform: string,
  opacity: number,
}

function Card(props: CardProps) {
  const { type = "NOTFOUND", children } = props;
  const [animation, setAnimation] = useState<CardAnimation>({ transform: "translateY(50px)", opacity: 0});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    setTimeout(() => {
      setAnimation({ transform: "translateY(0px)", opacity: 1});
      setMounted(true);
    }, 2);
  }, []);

  return (
    <div className='w-full h-fit flex flex-row items-center border-t-2 border-highlight/[0.5] transistion-all duration-500 ease-in-out'
      style={animation}
    >
      {type == CardType.SUCCESS ? <div className='w-2 h-full bg-accGreen' /> : <div className='w-2 h-full bg-accRed' />}
      <div className='w-full bg-highlight/[0.02] text-base whitespace-pre text-highlight pt-1 px-2 pb-3'>
        {children}
      </div>
    </div>
  )
}

export default Card