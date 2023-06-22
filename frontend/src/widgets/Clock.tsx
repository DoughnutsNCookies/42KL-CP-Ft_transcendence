import React, { useEffect, useState } from 'react'

const getCurrentTime = () => {
  return new Date().toLocaleTimeString();
}

function Clock() {

  const [clockTime, setClockTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => setClockTime(getCurrentTime), 1000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className='px-5 text-lg font-extrabold py-7 w-fit h-fit bg-highlight rounded-bl-xl'>
      {clockTime}
    </div>
  )
}

export default Clock