import React from 'react'

function ChatMsgIndicator(props: { hasNewMessage: boolean }) {

  const { hasNewMessage } = props;

  return (
    <div className={`rounded h-[30px] bg-accRed font-bold text-highlight text-sm animate-pulse px-2 ${hasNewMessage ? 'block' : 'hidden'}`}>
      <p className='m-auto mt-1 text-base font-extrabold uppercase whitespace-pre h-fit w-fit'> Unread </p>
    </div>
  )
}

export default ChatMsgIndicator