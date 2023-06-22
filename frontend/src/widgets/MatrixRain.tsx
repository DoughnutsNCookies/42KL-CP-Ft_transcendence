import React, { useEffect, useRef, useState } from 'react'
import sleep from '../functions/sleep';

var tileWidth: number = 30;
var tileHeight: number = 30;
var fontSize: number = 20;
var maxStackHeight: number;

var fadeFactor = 0.3;

interface column {
  x: number;
  stackHeight: number;
  stackCounter: number;
}

interface MatrixRainProps {
  animate?: boolean;
}

function MatrixRain(props: MatrixRainProps) {
  const { animate } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  var columns: column[] = [];

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const handleResize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      maxStackHeight = Math.ceil(canvas.height / tileHeight);

      columns = [];
      for (let i = 0; i < canvas.width / tileWidth; ++i) {
        var column: column = {
          x: i * tileWidth,
          stackHeight: 10 + Math.random() * maxStackHeight,
          stackCounter: Math.floor(Math.random() * maxStackHeight / 2)
        };
        columns.push(column);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();

    return () => observer.unobserve(container);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    maxStackHeight = Math.ceil(canvas.height / tileHeight);
    // divide the canvas into columns
    for (let i = 0; i < canvas.width / tileWidth; ++i) {
      var column: column = {
        x: i * tileWidth,
        stackHeight: 10 + Math.random() * maxStackHeight,
        stackCounter: 0
      };
      columns.push(column);
    }

    const interval = setInterval(() => {
      requestAnimationFrame(() => draw(ctx!, canvas));
    }, 100);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className='relative flex-1 w-full h-full' ref={containerRef}>
      <canvas className='absolute top-0 left-0 w-full h-full' id="canvas" ref={canvasRef}
        onClick={(e) => { e.preventDefault(); }}
      />
    </div>
  )

  async function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    {
      // draw a semi transparent black rectangle on top of the scene to slowly fade older characters
      // ctx.globalAlpha = 0.95;
      ctx.fillStyle = `rgba( 36, 36, 36 , ${fadeFactor} )`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // ctx.globalCompositeOperation = 'copy';
      // ctx.drawImage(canvas, 0, 0);
      // ctx.globalCompositeOperation = 'source-over';
      // ctx.globalAlpha = 1;
      // pick a font slightly smaller than the tile size
      ctx.font = `${fontSize}px jetbrains mono`;
      ctx.fillStyle = "rgb( 254, 248, 226, 0.5 )";
      for (let i = 0; i < columns.length; ++i) {
        // pick a random ascii character (change the 94 to a higher number to include more characters)
        var randomCharacter = String.fromCharCode(33 + Math.floor(Math.random() * 94));
        ctx.fillText(randomCharacter, columns[i].x, columns[i].stackCounter * tileHeight + tileWidth);

        // if the stack is at its height limit, pick a new random height and reset the counter
        if (++columns[i].stackCounter >= columns[i].stackHeight) {
          columns[i].stackHeight = 10 + Math.random() * maxStackHeight;
          columns[i].stackCounter = 0;
        }
      }
    }
  }
}

export default MatrixRain