import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FaTableTennis, FaTimes } from 'react-icons/fa'
import UserContext from '../../../contexts/UserContext';
import { gameData } from '../../../main';
import { ChatroomMessageData } from '../../../model/ChatRoomData';
import { ChatContext } from '../../../contexts/ChatContext';

interface ChatGameInviteProps {
  messageData: ChatroomMessageData;
}

function ChatGameInvite(props: ChatGameInviteProps) {

  const { messageData } = props;
  const { messageId, senderChannel } = messageData;
  const { activeInviteId } = useContext(ChatContext);
  const { myProfile } = useContext(UserContext);
  const isMyInvitation = useMemo(() => senderChannel.owner.intraName === myProfile.intraName, [senderChannel.owner, myProfile]);
  const [joinSuccessful, setJoinSuccessful] = useState(false);

  useEffect(() => {
    gameData.setJoinSuccessful = setJoinSuccessful;
  }, []);

  useEffect(() => {
    if (!joinSuccessful) return;
    setJoinSuccessful(false);
  }, [joinSuccessful]);

  return (
    <button className={`w-[65%] h-fit bg-highlight flex flex-row ${isMyInvitation && 'cursor-default'} group items-center`} onClick={acceptGameInvite} disabled={isMyInvitation} id={`${messageId}`}>
      <div className='flex flex-col flex-1 p-4 gap-y-1 items-start'>
        <p className='text-sm font-semibold text-dimshadow'><span className='font-extrabold bg-accGreen text-highlight px-[1ch]'>{senderChannel.owner.userName}</span> challenges you!</p>
        {isMyInvitation && ( activeInviteId === messageId) && (
          <p id={`${messageId}`} className='flex flex-row gap-x-1 items-center text-xs px-[1ch] cursor-pointer text-right hover:underline hover:bg-accRed text-dimshadow hover:text-highlight' onClick={cancelGameInvite}><FaTimes /> Cancel</p>
        )}
      </div>
      <div className='w-20 p-1 aspect-square bg-highlight'>
        <div className='flex flex-row items-center justify-center w-full h-full bg-dimshadow'>
          <FaTableTennis className='text-4xl text-highlight w-fit h-fit' />
        </div>
      </div>
    </button>
  )

  function acceptGameInvite() {
    if (senderChannel.owner.intraId === myProfile.intraId) return;
    gameData.joinInvite(messageId);
  }

  function cancelGameInvite() {
    if (senderChannel.owner.intraId !== myProfile.intraId) return;
    gameData.removeInvite(messageId);
  }
}

export default ChatGameInvite