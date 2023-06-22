import React from 'react'

interface StatusIndicatorProps {
  status: string;
  invert?: boolean;
  showText?: boolean;
  small?: boolean;
}

function StatusIndicator(props: StatusIndicatorProps) {

  const { status, invert = false, showText = true, small = false } = props;
  let indicatorStyle = `opacity-50 ${small ? 'border-[4px] xl:border-[4px]' : 'border-[5px] xl:border-[6px]'} ${invert ? 'border-highlight' : 'border-dimshadow'}`;

  if (status == "online")
    indicatorStyle = `bg-accGreen`;
  else if (status === "ingame") {
    indicatorStyle = `bg-accCyan`;
  }

  return (
    <div className={`w-full flex flex-row-reverse items-center gap-2`}>
      {showText && <p className={`lowercase text-md font-extrabold w-full opacity-50 ${invert ? 'text-highlight' : 'text-dimshadow'}`}>{status === 'ingame' ? 'in-game' : status}</p>}
      <div className={`rounded-full aspect-square ${small ? 'w-4' : 'w-6 xl:w-6'} ${status === 'offline' ? 'border-[5px] xl:border-[6px]' : ''} ${indicatorStyle} transition-all ease-in-out duration-200`}></div>
    </div>
  )
}

export default StatusIndicator