import React, { createContext, lazy, useEffect, useMemo, useState } from 'react'
import { GameData } from './game/gameData'
import { AppProvider, Container } from '@pixi/react';
import { Application, ICanvas } from 'pixi.js';
import Game from './game/Game';
import { clamp } from 'lodash';

interface GameAppProps {
  pixiApp: Application<ICanvas>;
  gameData: GameData;
}

export let GameDataCtx = createContext<GameData>(undefined as any);

let mouseLastMoveTime: number = 0;

function GameApp(props: GameAppProps) {
  const [scale, setScale] = useState<number>(1);
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const [usingTicker, setUsingTicker] = useState<boolean>(true);

  const { pixiApp, gameData } = props;
  useEffect(() => {
    pixiApp.ticker.maxFPS = 120;
    gameData.setShouldRender = setShouldRender;
    gameData.setScale = setScale;
    gameData.setUsingTicker = setUsingTicker;
    return () => {
      gameData.endGame()
    }
  }, []);

  useEffect(() => {
    pixiApp.screen.width = gameData.gameCurrentWidth;
    pixiApp.screen.height = gameData.gameCurrentHeight;
    window.addEventListener('mousemove', onmousemove);
    window.addEventListener('mousedown', onmousedown);
    window.addEventListener('mouseup', onmouseup);
    return () => {
      window.removeEventListener('mousemove', onmousemove);
      window.removeEventListener('mousedown', onmousedown);
      window.removeEventListener('mouseup', onmouseup);
    }
  }, [scale]);
  return (
    <AppProvider value={pixiApp}>
      <GameDataCtx.Provider value={gameData}>
        <Game shouldRender={shouldRender} scale={scale} usingTicker={usingTicker} />
      </GameDataCtx.Provider>
    </AppProvider>
  )

  function onmousemove(e: MouseEvent) {
    const currentTime = Date.now();
    if (currentTime - mouseLastMoveTime < 16) return;
    mouseLastMoveTime = currentTime;
    gameData.updatePlayerPosition(
      clamp((e.clientY - (window.innerHeight - gameData.gameCurrentHeight) * 0.5) / scale, 50, 850),
      clamp((e.clientX - (window.innerWidth - gameData.gameCurrentWidth) * 0.5) / scale, 30, 1570),
    );
  }

  function onmousedown() {
    gameData.updatePlayerClick(true);
  }

  function onmouseup() {
    gameData.updatePlayerClick(false);
  }
}

export default GameApp