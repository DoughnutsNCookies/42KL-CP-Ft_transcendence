import newMessage from "../../assets/sounds/new-message.wav";
import blackHole from "../../assets/sounds/BlackHole.wav";
import endGame from "../../assets/sounds/EndGame.wav";
import Wall from "../../assets/sounds/Wall.wav";
import Paddle from "../../assets/sounds/Paddle.wav";
import Score from "../../assets/sounds/Score.wav";
import Slow from "../../assets/sounds/Slow.wav";
import SlowEnd from "../../assets/sounds/SlowEnd.wav";
import Fast from "../../assets/sounds/Fast.wav";
import EndGameExplosion from "../../assets/sounds/EndGameExplosion.wav";

const messageNotificationSound = new Audio(newMessage);
const blackHoleSound = new Audio(blackHole);
const endGameSound = new Audio(endGame);

export enum HitType {
  NONE,
  WALL,
  PADDLE,
  SCORE,
  BLOCK,
  SLOW_IN,
  SLOW_OUT,
  FAST_IN,
  FAST_OUT,
  END_GAME,
}

let SoundPath: string[] = [
  "",
  Wall,
  Paddle,
  Score,
  Wall,
  Slow,
  SlowEnd,
  Fast,
  "",
  EndGameExplosion,
];

export const playNewMessageSound = () => {
  messageNotificationSound.addEventListener("loadedmetadata", () => {
    messageNotificationSound.play();
  });
};

export const playGameSound = (type: HitType) => {
  if (SoundPath[type] === "") return;
  new Audio(SoundPath[type]).play();
};

export const playBlackHoleSound = () => {
  blackHoleSound.volume = 1;
  blackHoleSound.play();
};

export const stopBlackHoleSound = () => {
  const fadeOutInterval = setInterval(() => {
    if (blackHoleSound.volume <= 0.1) {
      clearInterval(fadeOutInterval);
      blackHoleSound.pause();
      blackHoleSound.currentTime = 0;
    } else {
      blackHoleSound.volume -= 0.1;
    }
  }, 100);
};

export const playEngGameSound = () => {
  endGameSound.volume = 1;
  endGameSound.play();
};

export const stopEngGameSound = () => {
  const fadeOutInterval = setInterval(() => {
    if (endGameSound.volume <= 0.1) {
      clearInterval(fadeOutInterval);
      endGameSound.pause();
      endGameSound.currentTime = 0;
    } else {
      endGameSound.volume -= 0.1;
    }
  }, 100);
};
