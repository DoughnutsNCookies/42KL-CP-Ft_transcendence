import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Container, Graphics, useTick, useApp, Sprite } from '@pixi/react';
import { BoxSize, Offset } from '../../model/GameModels';
import * as PIXI from 'pixi.js';
import { GameData } from '../gameData';
import { GameDataCtx } from '../../GameApp';
interface PongProps {
	size: BoxSize;
}

function Pong(props: PongProps) {
	const { size } = props;
	const app = useApp();
	const gameData = useContext(GameDataCtx);
	const pongRef = useRef<PIXI.Sprite>(null);

	useTick((delta) => {
		if (pongRef.current == null) return;
		const pong = pongRef.current;
		pong.x = gameData.pongPosition.x;
		pong.y = gameData.pongPosition.y;
	});

	const texture = useMemo(() => {
		const g = new PIXI.Graphics();
		g.beginFill(0xFEF8E2);
		g.drawRect(0, 0, size.w, size.h);
		g.endFill();
		const texture = app.renderer.generateTexture(g);
		g.destroy();
		return texture;
	}, [size.w, size.h]);

	return (
		<Sprite ref={pongRef} x={gameData.pongPosition.x} y={gameData.pongPosition.y} width={size.w} height={size.h} texture={texture} />
	)
}

export default Pong