import React, { useEffect, useState } from 'react'

interface ChatroomTypingStatusProps {
  typingMembers: string[];
}

function ChatroomTypingStatus(props: ChatroomTypingStatusProps) {

  const { typingMembers } = props;
  const [typingStatus, setTypingStatus] = useState<string>("");

  if (typingMembers.length === 0) return (<></>);

  useEffect(() => {

    if (typingMembers.length === 0) return ;

    if (typingMembers.length === 1) {
      setTypingStatus(`${typingMembers[0]} is typing`);
    } else {
      setTypingStatus(`${typingMembers.length} people are typing`);
    }
  }, [typingMembers.length]);

  return (
    <div className='text-sm font-bold bg-highlight h-fit w-fit px-[1ch]'>
      <div className='flex flex-row gap-x-2 animate-pulse'>
        <p>{typingStatus}</p>
        <div className='flex flex-row items-center gap-x-0.5'>
          <p className='bg-dimshadow rounded w-1.5 h-1.5 text-xs whitespace-pre'> </p>
          <p className='bg-dimshadow rounded w-1.5 h-1.5 text-xs whitespace-pre'> </p>
          <p className='bg-dimshadow rounded w-1.5 h-1.5 text-xs whitespace-pre'> </p>
        </div>
      </div>
    </div>
  )
}

export default ChatroomTypingStatus