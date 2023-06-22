import { useState, useEffect, useRef } from 'react'
import sleep from '../functions/sleep'

const letters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const initTitle: string = 'PONGsh';
const timesBetweenLetters: number = 10;
const timesBeforeDone: number = 0;
const msBetweenAnimation: number = 7000;
const msBetweenSwitch: number = 30;

function Title() {
  const [title, setTitle] = useState(initTitle);
  const index = useRef(0);


  useEffect(animateStart, []);
  return (
    <h1 className='font-bungee text-highlight text-[200px] leading-none flex flex-row'>
      {title.split("").map((letter, index) => {
        let width: string = "w-[140px]";
        if (initTitle[index] === 's')
          width = "w-[125px]";
        else if (initTitle[index] === 'P')
          width = "w-[135px]";
        else if (initTitle[index] === 'N')
          width = "w-[143px]";
        return <span className={` ${width} block`} key={index}>{letter}</span>
      })}
    </h1>
  )

  function animateStart() {

    const interval = setInterval(animateTitle, msBetweenAnimation);
    return () => clearInterval(interval);
  }

  async function animateTitle() {
    let i = index.current;
    while (i <= initTitle.length * timesBetweenLetters) {
      const tmp = title.split("").map((letter, index) => {
        if (index >= i / timesBetweenLetters) return initTitle[index]
        return letters[Math.floor(Math.random() * 52)];
      }).join("");
      setTitle(tmp);
      i += 1;
      await sleep(msBetweenSwitch);
    }
    i = 0;
    while (i <= timesBeforeDone) {
      const tmp = title.split("").map(() => letters[Math.floor(Math.random() * 52)]).join("");
      setTitle(tmp);
      i += 1;
      await sleep(msBetweenSwitch);
    }
    i = 0;
    while (i <= initTitle.length * timesBetweenLetters) {
      const tmp = title.split("").map((letter, index) => {
        if (index <= i / timesBetweenLetters) return initTitle[index]
        return letters[Math.floor(Math.random() * 52)];
      }).join("");
      setTitle(tmp);
      i += 1;
      await sleep(msBetweenSwitch);
    }
    i = 0;
  }
}

export default Title