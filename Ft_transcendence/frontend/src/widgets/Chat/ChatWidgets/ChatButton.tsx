import React from 'react'

interface ChatButtonProps {
  icon?: React.ReactNode;
  title?: string;
  onClick?: () => void;
}

function ChatButton(props: ChatButtonProps) {

  const { icon, title, onClick } = props;

  return (
    <button
      className={`flex flex-row bg-highlight rounded p-2 w-fit h-fit items-center cursor-pointer group hover:bg-dimshadow border-2 border-highlight transition-all duration-200 focus:outline-dimshadow`}
      onClick={onClick}
    >
      <p className={`text-dimshadow group-hover:text-highlight text-lg ${(icon !== undefined && title !== undefined) && 'mr-2'}`}>{icon}</p>
      <p className='font-extrabold text-center uppercase text-md text-dimshadow group-hover:text-highlight'>{title}</p>
    </button>
  )
}

export default ChatButton