import React, { useEffect } from 'react'

interface player {
  position: number,
  score: number,
}

interface offset {
  top: number,
  left: number,
}

interface ball {
  offset: offset,
  direction: offset,
  speed: number,
}

function Pong() {
  const [player1, setPlayer1] = React.useState({ position: 0, score: 0 } as player);
  const [player2, setPlayer2] = React.useState({ position: 0, score: 0 } as player);
  const initBall = { offset: { top: 50, left: 50 }, direction: { top: 1, left: 0.5 }, speed: 0.5 } as ball;
  const [ball, setBall] = React.useState(initBall);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDownCapture, false);
    return () => document.removeEventListener('keydown', onKeyDownCapture, false);
  }, [onKeyDownCapture]);

  useEffect(() => {
    const interval = setInterval(() => {
      moveBall();
    }, 10);
    return () => clearInterval(interval);
  }, [ball]);

  return (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      w-3/4 aspect-[16/9] z-10'>
      <div className=' absolute top-0 left-0 rounded-2xl bg-gray-950 opacity-60 w-[100%] h-[100%]'
        style={{ boxShadow: "0 0 20px 0 rgb(3 7 18 / var(--tw-bg-opacity)),0 0 5px 0 rgb(3 7 18 / var(--tw-bg-opacity))" }}
      />
      <div className=' absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row text-[260px] opacity-50'
        style={{
          textShadow: "0 0 120px  #fef8e277,0 0 40px  #fef8e277,0 0 20px  #fef8e277,0 0 5px  #fef8e2"
        }}
      >
        {player1.score}|{player2.score}
      </div>
      <div className='relative'
        style={{ width: "100%", height: "100%" }}
      >
        <div className='absolute rounded-sm opacity-80 bg-highlight'
          style={{
            top: `${player1.position}%`, left: "1%", width: "1.3%", height: "30%", transition: "all 0.15s",
            boxShadow: "0 0 20px 0 #fef8e2,0 0 5px 0 #fef8e2"
          }}
        />
        <div className='absolute rounded-sm opacity-80 bg-highlight'
          style={{
            top: `${player2.position}%`, right: "1%", width: "1.3%", height: "30%", transition: "all 0.15s",
            boxShadow: "0 0 20px 0 #fef8e2,0 0 5px 0 #fef8e2"
          }}
        />
        <div className='absolute bg-highlight rounded-2xl'
          style={{
            top: `${ball.offset.top}%`, left: `${ball.offset.left}%`, width: "1.3%", height: "2.31%", transition: "all 0.05s",
            boxShadow: "0 0 200px 10px #fef8e2,0 0 100px 2px #fef8e2,0 0 50px 2px #fef8e2,0 0 20px 2px #fef8e2,0 0 10px 2px #fef8e2,0 0 5px 2px #fef8e2"
          }}
        />
        {/* <div
          className='absolute rounded-2xl'
          style={{
            top: `${ball.offset.top}%`, left: `${ball.offset.left}%`, width: "1.3%", height: "2.31%", transition: "all 0.05s",
            textShadow: "0 0 30px  #fef8e2, 0 0 15px #fef8e2,0 0 10px #fef8e2,0 0 5px #fef8e2,0 0 2px #fef8e2, 0 0 1px #fef8e2"
          }}
        >
          DVD
        </div> */}
      </div>
    </div>
  )

  function moveBall() {
    const newBall = { ...ball };
    newBall.offset.top += newBall.direction.top * newBall.speed;
    newBall.offset.left += newBall.direction.left * newBall.speed;
    if (newBall.offset.top <= 0 || newBall.offset.top >= 98.5) {
      newBall.direction.top = - newBall.direction.top;
    }
    if (newBall.offset.left <= -1) {
      newBall.direction.left = 1;
      newBall.direction.top = Math.random() - 0.5;
      setPlayer2({ ...player2, score: player2.score + 1 });
      newBall.offset = { top: 50, left: 50 };
    } else if (newBall.offset.left >= 100) {
      newBall.direction.left = -1;
      newBall.direction.top = Math.random() - 0.5;
      setPlayer1({ ...player1, score: player1.score + 1 });
      newBall.offset = { top: 50, left: 50 };
    }
    if (newBall.offset.left <= 1 && newBall.offset.top >= player1.position && newBall.offset.top <= player1.position + 30) {
      newBall.direction.left = - newBall.direction.left;
      newBall.direction.top += (newBall.offset.top - player1.position - 15) / 20;
    }
    if (newBall.offset.left >= 98 && newBall.offset.top >= player2.position && newBall.offset.top <= player2.position + 30) {
      newBall.direction.left = - newBall.direction.left;
      newBall.direction.top += (newBall.offset.top - player2.position - 15) / 20;
    }

    setBall(newBall);
  }

  function onKeyDownCapture(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      if (player2.position <= 0) return;
      setPlayer2({ ...player2, position: player2.position - 5 });
    }
    if (e.key === 'ArrowDown') {
      if (player2.position + 30 >= 100) return;
      setPlayer2({ ...player2, position: player2.position + 5 });
    }
    if (e.key === 'w') {
      if (player1.position <= 0) return;
      setPlayer1({ ...player1, position: player1.position - 5 });
    }
    if (e.key === 's') {
      if (player1.position + 30 >= 100) return;
      setPlayer1({ ...player1, position: player1.position + 5 });
    }
  }
}

export default Pong