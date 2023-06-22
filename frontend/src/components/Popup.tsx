import React, { useEffect, useRef, useState } from 'react'
import { FaDizzy, FaTableTennis } from 'react-icons/fa'
import Button from './Buttons';

interface ErrorPopupProps {
  text: string;
}

export function CookiePopup() {
  return (
    <div className='overflow-hidden border-4 w-fit h-fit rounded-2xl bg-dimshadow text-highlight border-highlight'>
      <div className='p-8'> 
        <div className='flex flex-row items-center text-3xl'>
          <p className='relative z-10 font-extrabold capitalize highlight'>
            we uses cookies
          </p>
          <FaTableTennis className='ml-3.5 text-2xl'/>
        </div>
        <p className='mt-4 text-base font-normal'>Accepting cookies is the secret to becoming a ping pong champion. Trust us, we're the experts!</p>
      </div>
      <div className='flex flex-row overflow-hidden border-t-4 divide-x-4 divide-highlight border-highlight'>
        <Button
          title='Nahhh'
          textTransform='uppercase'
          flex='1'
          padding='3'
          bgColor='dimshadow'
          textColor='highlight'
          />
        <Button
          title='Erm... Sure?'
          textTransform='uppercase'
          flex='1'
          padding='3'
          bgColor='dimshadow'
          textColor='highlight'
        />
      </div>
    </div>
  )
}

export function ErrorPopup(props: ErrorPopupProps) {
  
  const [position, setPosition] = useState(100);
  const { text } = props;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPosition(0);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
    }
  }, []);

  return (
    <div
      className='z-[100] flex flex-row items-center overflow-hidden transition-transform duration-200 ease-in-out transform border-2 border-solid  w-fit h-fit rounded-l-xl bg-dimshadow lg:border-3 border-highlight'
      style={{ transform: `translateX(${position}%)`}}
    >
      <div className='p-2.5 text-xl lg:text-2xl text-dimshadow bg-highlight'>
        <FaDizzy className='animate-spin' />
      </div>
      <p className='flex-grow px-6 text-sm text-center uppercase text-highlight lg:text-lg w-fit'>{text}</p>
    </div>
  )
}

interface CollapsiblePopup {
  icon: React.ReactNode;
  content: React.ReactNode;
}

export function CollapsiblePopup(props: CollapsiblePopup) {

  const { icon, content } = props;
  const [opacity, setOpacity] = useState(100);
  const [position, setPosition] = useState("-100px");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // animation: when this component get rendered on screen
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPosition("0px");
    }, 20);
    setIsCollapsed(false);

    return () => {
      clearTimeout(timeoutId);
    }
  }, [props.content]);

  useEffect(() => {
    if (isCollapsed)
      setOpacity(50);
    else
      setOpacity(100);
  })

  return (
    <div className='bg-dimshadow flex flex-row items-center absolute w-96 h-36 left-0 top-10 rounded-r-2xl border-highlight border-[8px] border-l-0 z-20 overflow-hidden animate-left-to-right transition-all duration-300' style={{left: `${position}`, opacity: `${opacity}%`}}>
      <div className='w-[85%] h-full border-r-8 border-highlight p-4 flex flex-row items-center' ref={contentRef}>
        {content}
      </div>
      <div className='relative w-[15%] h-full cursor-pointer hover:opacity-100 bg-accCyan' onClick={collapseCard}>
        <div className='absolute w-full h-7 -skew-y-[20deg] bg-highlight/20 animate-shine'></div>
        <div className='flex flex-row items-center w-full h-full'>
          {icon}
        </div>
      </div>
    </div>
  )

  function collapseCard() {
    if (contentRef.current && !isCollapsed)
      setPosition(`${-contentRef.current.clientWidth}px`);
    else
      setPosition(`0px`);
    setIsCollapsed(!isCollapsed);
  }
}
