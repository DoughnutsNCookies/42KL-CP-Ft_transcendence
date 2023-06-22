import React, { useContext } from 'react'
import { FaSadTear, FaUsers } from 'react-icons/fa'
import ChatButton from './ChatWidgets/ChatButton'
import { HiServer } from 'react-icons/hi'
import { ChatContext } from '../../contexts/ChatContext';
import NewChannel from './ChatroomBody/Channel/NewChannel';
import ChannelList from './ChatroomBody/Channel/ChannelList';

function ChatEmptyState() {

  const { setChatBody } = useContext(ChatContext);

  return (
    <div className='w-[60%] flex flex-col gap-y-3.5 text-highlight items-center m-auto mt-40'>
      <FaSadTear className='text-accYellow text-7xl' />
      <p className='text-xl font-extrabold'>No messages, yet.</p>
      <p className='text-center'>Ready to ball out? Add a friend to chat with them or join a channel to rally up.</p>
      <ChatButton icon={<HiServer />} title="join channel" onClick={() => setChatBody(<ChannelList />)} />
      <ChatButton icon={<FaUsers />} title="new channel" onClick={() => setChatBody(<NewChannel />)} />
    </div>
  )
}

export default ChatEmptyState