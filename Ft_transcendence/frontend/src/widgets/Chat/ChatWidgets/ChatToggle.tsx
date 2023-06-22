import React from 'react'
import { BsFillChatLeftFill } from 'react-icons/bs';
import ChatSearchBar from './ChatSearchBar';
import ChatMsgIndicator from './ChatMsgIndicator';
import ChatButton from './ChatButton';
import { FaArrowLeft, FaPlusSquare } from 'react-icons/fa';

interface ChatToggleProps {
  toggleChat: () => void;
  expanded: boolean;
  hasNewMessage: boolean;
}

function ChatToggle(props: ChatToggleProps) {

  const { toggleChat, expanded, hasNewMessage } = props;

  return (
    <div className='z-10 flex flex-row items-center justify-between w-full p-4 uppercase cursor-pointer h-fit text-dimshadow bg-highlight' onClick={toggleChat}>
      <div className='flex flex-row items-center text-xl'>
        <p className='font-extrabold'>chat</p>
        <BsFillChatLeftFill className='ml-3' />
      </div>
      {!expanded && <ChatMsgIndicator hasNewMessage={hasNewMessage} />
      }
    </div>
  )
}

export default ChatToggle