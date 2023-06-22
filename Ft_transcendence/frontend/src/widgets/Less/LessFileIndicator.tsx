import React from 'react'

interface LessFileIndicatorProps {
  fileString: string;
}

function LessFileIndicator(props: LessFileIndicatorProps) {

  const { fileString } = props;

  return (
    <div className={`${fileString.length > 40 ? 'w-[50ch]' : 'w-fit'} overflow-hidden text-dimshadow text-base`}>
      <p className={`${fileString.length > 40 && 'animate-marquee'}`}>{fileString}</p>
    </div>
  )
}

export default LessFileIndicator