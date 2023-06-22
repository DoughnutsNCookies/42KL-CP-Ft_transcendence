import { useContext, useMemo, useRef } from 'react'
import * as PIXI from 'pixi.js';
import { Container, Sprite, useApp, useTick } from '@pixi/react';
import { GameDataCtx } from '../../GameApp';

function InwardShadow() {
  const app = useApp();
  const gameData = useContext(GameDataCtx);
  const containerRef = useRef<PIXI.Container>(null);

  const alphaRot = useRef(0);

  useTick(() => {
    if (!containerRef.current) return;
    const alpha = 0.8 + 0.2 * Math.sin(alphaRot.current);
    containerRef.current.alpha = alpha;
    alphaRot.current += 0.003 * gameData.pongSpeed.x;
  }, gameData.gameType === 'death');

  const texture = useMemo(() => {
    let color: number;
    switch (gameData.gameType) {
      case 'death':
        color = 0xAD6454;
        break;
      case 'boring':
        color = 0x242424;
        break;
      case 'standard':
        color = 0x000000;
        break;
      default:
        color = 0x000000;
    }

    const box = new PIXI.Graphics();
    box.drawRect(0, 0, 1, 100);

    for (let i = 0; i < 100; i++) {
      box.beginFill(color, Number(((i / 110) ** 3).toFixed(2)));
      box.drawRect(0, 100 - i, 1, 1);
      box.endFill();
    }

    const texture = app.renderer.generateTexture(box);
    box.destroy();
    return texture;
  }, [gameData.gameType]);

  return (
    <Container ref={containerRef}>
      <Sprite x={0} y={0} width={1600} height={200} texture={texture} />
      <Sprite x={1600} y={900} width={1600} height={200} texture={texture} angle={180} />
      <Sprite x={1600} y={0} width={900} height={200} texture={texture} angle={90} />
      <Sprite x={0} y={900} width={900} height={200} texture={texture} angle={270} />
    </Container>
  )
}

export default InwardShadow