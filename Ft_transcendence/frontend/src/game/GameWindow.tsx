import React, { useEffect, useRef } from 'react'
import { gameData } from '../main';

function GameWindow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const currentDiv = ref.current;

    const handleResize = () => {
      if (!ref.current) return;
      const { top, left, width, height } = ref.current.getBoundingClientRect();
      const canvas = document.getElementById('pixi') as HTMLCanvasElement;
      canvas.width = width - 12;
      canvas.height = height - 12;
      canvas.style.width = `${width - 12}px`;
      canvas.style.height = `${height - 12}px`;
      canvas.style.display = 'block';
      document.documentElement.style.setProperty('--canvas-top', `${top + 6}px`);
      document.documentElement.style.setProperty('--canvas-left', `${left + 6}px`);
      if (gameData.setScale)
        gameData.setScale(width / 1600);
    }

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(currentDiv);

    return () => observer.unobserve(currentDiv);
  }, []);
  return (
    <div ref={ref} className='absolute w-full overflow-hidden border-4  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 aspect-video rounded-md border-highlight max-w-7xl' />
  )
}

export default GameWindow