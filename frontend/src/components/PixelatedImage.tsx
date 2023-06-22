import React, { useEffect, useRef, useState } from 'react'
import Worker from '../workers/pixilation.worker?worker'

interface PixelatedImageProps {
  src: string;
  pixelSize?: number;
  className?: string;
}
const pixilationWorker = new Worker();

function PixelatedImage(props: PixelatedImageProps) {
  const { src, pixelSize = 1, className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    saveImageToCache(src).then((imageData) => {

      const image = new Image();
      image.src = imageData;
      image.crossOrigin = "Anonymous";
      image.style.objectFit = "cover";
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        cropToSquare(image, canvas, ctx);
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        pixilationWorker.postMessage({
          type: 'PIXILATE',
          payload: {
            imageData: imageData,
            w: canvas.width,
            h: canvas.height,
            pixelSize: pixelSize
          }
        });
      }
    });
  }, [pixelSize]);

  useEffect(() => {
    pixilationWorker.onmessage = (event) => {
      const { type, payload } = event.data;
      switch (type) {
        case 'PIXILATE':
          const { imageData, w, h } = payload;
          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          canvas.width = w;
          canvas.height = h;
          if (!ctx) return;
          ctx.imageSmoothingEnabled = false;
          ctx.putImageData(imageData, 0, 0);
          break;
      }
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={className} />
  )


  function draw(image: HTMLImageElement) {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    image.src = src;
    image.crossOrigin = "Anonymous";
    // image.src = 'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*';
    image.onload = () => {
      ctx!.imageSmoothingEnabled = false;
      cropToSquare(image, canvas, ctx!);

      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y += pixelSize) {
        for (let x = 0; x < canvas.width; x += pixelSize) {
          const pixelIndex = (y * canvas.width + x) * 4;
          const r = imageData.data[pixelIndex];
          const g = imageData.data[pixelIndex + 1];
          const b = imageData.data[pixelIndex + 2];
          for (let i = 0; i < pixelSize; i++) {
            for (let j = 0; j < pixelSize; j++) {
              const row = y + i;
              const col = x + j;
              const index = (row * canvas.width + col) * 4;
              imageData.data[index] = r;
              imageData.data[index + 1] = g;
              imageData.data[index + 2] = b;
            }
          }
        }
      }
      ctx!.putImageData(imageData, 0, 0);
    }

  }

  function saveImageToCache(imageUrl: string) {
    const cacheKey = `image-${imageUrl}`;
    const cachedImageData = sessionStorage.getItem(cacheKey);
    if (cachedImageData) {
      // Image data is already cached, no need to download it again
      return Promise.resolve(cachedImageData);
    }
    // Image data is not cached, download it and save to cache
    return fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const imageData = reader.result as string;
          sessionStorage.setItem(cacheKey, imageData);
          resolve(imageData);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }

  function cropToSquare(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    const size = Math.min(image.width, image.height);
    const x = (image.width - size) / 2;
    const y = (image.height - size) / 2;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
  }
}

export default PixelatedImage