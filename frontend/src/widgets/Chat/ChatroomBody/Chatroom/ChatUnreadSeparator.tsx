import React, { useEffect, useState } from 'react'

interface ChatUnreadSeparatorProps {
  pingServer: () => void;
}

function ChatUnreadSeparator() {
  return (
    <div className={`w-full h-fit flex flex-row items-center`}>
      <div className='w-full h-1 bg-highlight'></div>
      <p className='mx-4 text-base font-extrabold text-highlight'>NEW</p>
      <div className='w-full h-1 bg-highlight'></div>
    </div>
  )
}

export default ChatUnreadSeparator