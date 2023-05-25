import React, { useContext, useEffect } from 'react'
import { ChatroomMessageData } from '../../../../model/ChatRoomData'
import PreviewProfileContext from '../../../../contexts/PreviewProfileContext';
import Profile from '../../../Profile/Profile';

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
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);

  return (
    <div className={`flex flex-col ${isMyMessage ? 'items-end ml-auto' : 'items-start'} w-[90%] box-border gap-y-1`}>
      <p className={`text-xs font-normal ${ isMyMessage ? 'bg-accCyan text-highlight' : 'bg-highlight text-dimshadow' } w-fit cursor-pointer px-1`} onClick={previewProfile}>{ messageData.senderChannel.owner.userName }</p>
      <p className={`w-full h-fit whitespace-normal break-all ${ isMyMessage ? 'text-right' : 'text-left' } text-base font-medium text-highlight select-text selection:bg-highlight selection:text-dimshadow`}>
        { messageData.message }
      </p>
      <p className='text-highlight/50 text-xs font-normal'>{ convertDatetoString(messageData.timeStamp) }</p>
    </div>
  )

  function previewProfile() {
    setPreviewProfileFunction(messageData.senderChannel.owner);
    setTopWidgetFunction(<Profile expanded={true} />);
  }
}

export default ChatroomMessage