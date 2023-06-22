import React, { useEffect } from 'react'
import ChatSearchBar from './ChatSearchBar';


interface ChatTableTitleProps {
  title?: string;
  searchable?: boolean;
  setFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
}

function ChatTableTitle(props: ChatTableTitleProps) {

  const { title, searchable, setFilterKeyword } = props;
  const [animate, setAnimate] = React.useState(false);
  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className={`flex flex-row items-center justify-between ${animate ? "" : "-translate-y-3 opacity-0"} transition-all duration-500`}>
      <p className='text-sm capitalize text-highlight/50'>{title}</p>
      <div className='flex flex-row'>
        {searchable && <ChatSearchBar invert={true} setFilterKeyword={setFilterKeyword} />}
      </div>
    </div>
  )
}

export default ChatTableTitle