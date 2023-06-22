import React, { useContext, useEffect, useState } from 'react'
import sleep from '../functions/sleep'

interface QueueProps {
  queueType: string;
  expanded: boolean;
}

const getCurrentTime = () => {
  return new Date().toLocaleTimeString();
}

function Queue(props: QueueProps) {
  const { queueType, expanded } = props;
  const maxHeight = 80;
  const [height, setHeight] = useState(0);
  const [clockTime, setClockTime] = useState(0);

  useEffect(() => {
    if (height == 0 && expanded) {
      setClockTime(0);
      setHeight(80);
    }
    if (height == maxHeight && !expanded)
      setHeight(0);
  }, [expanded]);

  useEffect(() => {
    const interval = setInterval(() => {
      setClockTime(clockTime + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [clockTime])

  return (
    <div className='absolute top-0 w-full bg-highlight'>
      <div className='flex flex-row justify-between overflow-hidden w-full box-border transition-all duration-500 ease-in-out bg-dimshadow cursor-pointer'
        style={{ height: height, marginBottom: height === 0 ? 0 : 4 }}
      >
        <div className='flex flex-col flex-1 justify-center bg-dimshadow px-5'>
          <div className='text-2xl text-highlight font-extrabold'>
            <span>In Queue: </span>
            <span style={{ color: queueType === "boring" ? "rgb(var(--highlight-color))" : queueType === "standard" ? "rgb(var(--accent-cyan))" : "rgb(var(--accent-red))" }}>{queueType.charAt(0).toUpperCase() + queueType.slice(1)}</span>
          </div>
          <div className='text-xs text-highlight'>Waiting for players...</div>
        </div>
        <div className='flex flex-col flex-1 justify-center bg-dimshadow text-highlight'>
          {Math.floor(clockTime / 60).toString().padStart(2, "0")}:{(clockTime % 60).toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  )
}

export default Queue