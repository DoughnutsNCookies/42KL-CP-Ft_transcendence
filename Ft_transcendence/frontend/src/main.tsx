import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { createRoot } from '@pixi/react';
import { Application } from 'pixi.js';

import { GameData } from './game/gameData';
import GameApp from './GameApp';
import React from 'react';

const reactApp = document.getElementById('root') as HTMLElement
const reactRoot = ReactDOM.createRoot(reactApp)
reactRoot.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

export const gameData = new GameData();
const pixiApp = new Application({
  width: 1600,
  height: 900,
  sharedTicker: true,
  autoDensity: true,
  // resolution: devicePixelRatio,
  resolution: 1,
  backgroundColor: 0x242424,
  view: document.getElementById('pixi') as HTMLCanvasElement,
});

const pixiRoot = createRoot(pixiApp.stage);
pixiRoot.render(<GameApp pixiApp={pixiApp} gameData={gameData} />);
