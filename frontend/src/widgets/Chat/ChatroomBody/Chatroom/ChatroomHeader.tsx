import React, { useContext, useState } from 'react'
import { ImEarth } from 'react-icons/im'
import ChatNavbar from '../../ChatWidgets/ChatNavbar'
import { ChatContext, NewChannelContext } from '../../../../contexts/ChatContext';
import ChatroomList from './ChatroomList';
import { FaUser, FaUserSecret } from 'react-icons/fa';
import { ChatroomData } from '../../../../model/ChatRoomData';
import PreviewProfileContext from '../../../../contexts/PreviewProfileContext';
import Profile from '../../../Profile/Profile';
import ChannelInfo from '../Channel/ChannelInfo';

interface ChatroomHeaderProps {
  chatroomData: ChatroomData;
  viewMemberListButton: () => React.ReactNode;
}

function ChatroomIcon(props: { isRoom: boolean, isPrivate: boolean }) {
  
  const { isRoom, isPrivate } = props;

  if (!isRoom) return (<FaUser className='text-base' />);

  if (isRoom && isPrivate) return (<FaUserSecret className='text-base' />)

  if (isRoom && !isPrivate) return (<ImEarth className='text-base' />)

  return (<></>);
}

function ChatroomHeader(props: ChatroomHeaderProps) {

  const { chatroomData, viewMemberListButton } = props;
  const { dispatch } = useContext(NewChannelContext);
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);
  const { setChatBody } = useContext(ChatContext);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className='w-full h-fit'>
      <ChatNavbar backAction={closeChatroom} nextComponent={chatroomData.isRoom && viewMemberListButton()}>
        <div className='z-20 w-3/5 px-4 py-2 mx-auto transition-all duration-150 border-2 cursor-pointer text-dimshadow bg-highlight border-highlight group hover:bg-dimshadow hover:text-highlight' onClick={checkChannelInfo}>
          <div className='flex flex-row items-center gap-3 w-fit mx-auto max-w-[90%]'>
            <p className='text-xl font-extrabold truncate w-fit'>{chatroomData.isRoom ? chatroomData.channelName : chatroomData.owner?.userName}</p>
            <ChatroomIcon isRoom={chatroomData.isRoom} isPrivate={chatroomData.isPrivate} />
          </div>
        </div>
      </ChatNavbar>
    </div>
  )

  function checkChannelInfo() {
    if (chatroomData.isRoom) {
      dispatch({ type: 'IS_EDIT_CHANNEL' });
      setChatBody(<ChannelInfo chatroomData={chatroomData} />);
    } else {
      setPreviewProfileFunction(chatroomData.owner!);
      setTopWidgetFunction(<Profile expanded={!expanded} />);
      setExpanded(!expanded);
    }
  }

  function closeChatroom() {
    setChatBody(<ChatroomList />);
    dispatch({ type: 'RESET' });
  }
}

export default ChatroomHeader