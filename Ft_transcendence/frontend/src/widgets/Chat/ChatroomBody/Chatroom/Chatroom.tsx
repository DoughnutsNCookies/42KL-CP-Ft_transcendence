import React, { useContext } from 'react'
import { FaUser, FaUserSecret, FaUsers } from 'react-icons/fa'
import ChatMsgIndicator from '../../ChatWidgets/ChatMsgIndicator'
import { ChatContext } from '../../../../contexts/ChatContext';
import ChatroomContent from './ChatroomContent';
import { ChatroomData } from '../../../../model/ChatRoomData';
import { ImEarth } from 'react-icons/im';

interface ChatroomProps {
  hasUnReadMsg: boolean;
  chatroomData: ChatroomData;
}

function Chatroom(props: ChatroomProps) {

  const { chatroomData, hasUnReadMsg } = props;
  const { setChatBody } = useContext(ChatContext);

  return (
    <div
      className='flex flex-row w-full cursor-pointer h-14 group'
      onClick={() => setChatBody(<ChatroomContent chatroomData={chatroomData!} />)}
    >
      <div className={`${chatroomData.isRoom && 'p-3'} bg-highlight aspect-square h-full`}>
        {
          chatroomData.isRoom
            ? (chatroomData.isPrivate ? <FaUserSecret className='w-full h-full text-dimshadow' /> : <ImEarth className='w-full h-full text-dimshadow' />)
            : <img className="object-cover h-full aspect-square" src={chatroomData.owner!.avatar} alt={chatroomData.owner!.userName + `_avatar`} />
        }
      </div>
      <div className='flex flex-row items-center justify-between w-full p-5 border-b-2 border-box border-highlight/50'>
        <p className='text-base font-extrabold truncate text-highlight group-hover:underline'>{chatroomData.isRoom ? `${chatroomData.channelName}` : `${chatroomData.owner!.userName} (${chatroomData.owner!.intraName})`}</p>
        <ChatMsgIndicator hasNewMessage={hasUnReadMsg} />
      </div>
    </div>
  )
}

export default Chatroom