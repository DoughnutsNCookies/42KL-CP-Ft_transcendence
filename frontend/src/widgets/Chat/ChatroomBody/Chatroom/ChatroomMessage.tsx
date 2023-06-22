import React, { useContext, useEffect, useMemo } from 'react'
import { ChatroomMessageData } from '../../../../model/ChatRoomData'
import PreviewProfileContext from '../../../../contexts/PreviewProfileContext';
import Profile from '../../../Profile/Profile';
import ChatGameInvite from '../../ChatWidgets/ChatGameInvite';
import { FriendsContext } from '../../../../contexts/FriendContext';
import UserContext from '../../../../contexts/UserContext';
import { GameDataCtx } from '../../../../GameApp';

interface ChatroomMessageProps {
  messageData: ChatroomMessageData;
  isMyMessage: boolean;
}

function convertDatetoString(ISOString: string) {
  const date = new Date(ISOString);
  const formattedDateString = date.toLocaleString();
  return formattedDateString;
}

function ChatroomMessage(props: ChatroomMessageProps) {

  const { messageData, isMyMessage } = props;
  const { friends } = useContext(FriendsContext);
  const { myProfile } = useContext(UserContext)
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);
  const isMessageFromBlockedUser = useMemo(checkIfFriendIsBlocked, [friends]);
  const isGameInvite = useMemo(() => messageData.message === "/invite", []);

  return (
    <div className={`flex flex-col ${isMyMessage ? 'items-end ml-auto' : 'items-start'} w-[90%] box-border gap-y-1`}>
      <p className={`text-xs font-normal ${ isMyMessage ? 'bg-accCyan text-highlight' : 'bg-highlight text-dimshadow' } w-fit ${!isMessageFromBlockedUser && 'cursor-pointer'} px-1`} onClick={previewProfile}>{ (!isMessageFromBlockedUser) ? messageData.senderChannel.owner.userName : `blocked user` }</p>
      {
        isMessageFromBlockedUser
          ? <p className={`w-fit h-fit whitespace-normal break-all ${ isMyMessage ? 'text-right' : 'text-left' } text-sm font-medium bg-accRed text-highlight px-[1ch]`}>BLOCKED MESSAGE</p>
          : isGameInvite
            ? <ChatGameInvite messageData={messageData}/>
            : <p className={`w-full h-fit whitespace-normal break-all ${ isMyMessage ? 'text-right' : 'text-left' } text-base font-medium text-highlight select-text selection:bg-highlight selection:text-dimshadow`}>{ messageData.message }</p> 
      }
      <p className='text-xs font-normal text-highlight/50'>{ convertDatetoString(messageData.timeStamp) }</p>
    </div>
  )

  function checkIfFriendIsBlocked() {
    if (messageData.senderChannel.owner.intraId === myProfile.intraId) return false;
    const friendRelationship = friends.find((friend) => friend.sender.intraId === messageData.senderChannel.owner.intraId || friend.receiver.intraId === messageData.senderChannel.owner.intraId);
    if (friendRelationship === undefined) return false;
    if (friendRelationship.status.toLowerCase() === "blocked") return true;
    return false;
  }

  function previewProfile() {
    if (isMessageFromBlockedUser) return;
    setPreviewProfileFunction(messageData.senderChannel.owner);
    setTopWidgetFunction(<Profile expanded={true} />);
  }
}

export default ChatroomMessage