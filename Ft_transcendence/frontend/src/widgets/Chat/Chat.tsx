import React, { useContext, useEffect, useMemo, useReducer, useState } from 'react'
import ChatToggle from './ChatWidgets/ChatToggle'
import ChatroomList from './ChatroomBody/Chatroom/ChatroomList';
import { ChatContext, ChatroomsContext, NewChannelContext } from '../../contexts/ChatContext';
import SocketApi from '../../api/socketApi';
import { ChatroomMessageData } from '../../model/ChatRoomData';
import { getFriendList } from '../../api/friendListAPI';
import { FriendsContext } from '../../contexts/FriendContext';
import newChannelReducer, { newChannelInitialState } from './ChatroomBody/Channel/newChannelReducer';
import { gameData } from '../../main';

const CHAT_SOCKET_NAMESPACE = "chat";

function Chat() {

  const { setFriends } = useContext(FriendsContext);
  const [state, dispatch] = useReducer(newChannelReducer, newChannelInitialState)
  const [unreadChatrooms, setUnreadChatrooms] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [chatroomBody, setChatroomBody] = useState(<ChatroomList />);
  const chatSocket = useMemo(() => new SocketApi(CHAT_SOCKET_NAMESPACE), []);
  const [activeInviteId, setActiveInviteId] = useState<number>(-1);

  useEffect(() => {

    gameData.setActiveInviteId = setActiveInviteId;

    // for receive new message
    const newUnreadChatrooms: number[] = [];
    chatSocket.connect();
    chatSocket.listen("message", (data: ChatroomMessageData) => {
      const channelInfo = (data.isRoom ? data.receiverChannel : data.senderChannel);
      if (unreadChatrooms.includes(channelInfo.channelId)) return;
      newUnreadChatrooms.push(channelInfo.channelId);
      setUnreadChatrooms(newUnreadChatrooms);
    });
    return () => chatSocket.removeListener("message");
  }, []);

  useEffect(() => {
    // fetch friends list when chat is expanded
    if (expanded) getFriendList().then(friends => setFriends(friends.data));
  }, [expanded]);

  // toggle chat
  const handleToggleChat = () => {
    // expand chat
    setExpanded(!expanded);
  }

  return (
    <ChatroomsContext.Provider value={{ unreadChatrooms: unreadChatrooms, setUnreadChatrooms: setUnreadChatrooms }}>
      <ChatContext.Provider value={{ chatSocket: chatSocket, chatBody: chatroomBody, setChatBody: setChatroomBody, expanded: expanded, activeInviteId: activeInviteId }}>
        <NewChannelContext.Provider value={{ state, dispatch }}>
          <div className={`flex flex-col select-none transition-all duration-300 overflow-hidden ${expanded ? 'h-full' : 'h-[60px]'} box-border`}>
            <ChatToggle toggleChat={handleToggleChat} expanded={expanded} hasNewMessage={unreadChatrooms.length > 0} />
            {chatroomBody}
          </div>
        </NewChannelContext.Provider>
      </ChatContext.Provider>
    </ChatroomsContext.Provider>
  )
}

export default Chat