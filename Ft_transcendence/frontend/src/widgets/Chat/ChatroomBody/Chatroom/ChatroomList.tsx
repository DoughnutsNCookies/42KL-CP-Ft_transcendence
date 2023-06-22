import React, { useContext, useEffect, useReducer, useState } from 'react'
import Chatroom from './Chatroom'
import ChatButton from '../../ChatWidgets/ChatButton'
import { HiServer } from 'react-icons/hi';
import { FaMeh, FaPlusSquare } from 'react-icons/fa'
import ChatEmptyState from '../../ChatEmptyState';
import NewChannel from '../Channel/NewChannel';
import { ChatContext, ChatroomsContext } from '../../../../contexts/ChatContext';
import { getChatroomList } from '../../../../api/chatAPIs';
import { ChatroomData, ChatroomMessageData } from '../../../../model/ChatRoomData';
import { FriendsContext } from '../../../../contexts/FriendContext';
import ChatTableTitle from '../../ChatWidgets/ChatTableTitle';
import ChannelList from '../Channel/ChannelList';

function FilteredChatroomEmptyState() {
  return (
    <div className='w-full h-full relative'>
      <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-highlight gap-y-3'>
        <p className='text-center'>There's no existing chatroom that matches your search</p>
        <FaMeh className='text-3xl'/>
      </div>
    </div>
  )
}

function ChatroomList() {

  const { chatSocket, expanded } = useContext(ChatContext);
  const { unreadChatrooms, setUnreadChatrooms } = useContext(ChatroomsContext);
  const { friends } = useContext(FriendsContext);
  const { setChatBody } = useContext(ChatContext);
  const [chatrooms, setChatrooms] = useState<ChatroomData[]>([]);
  const [filterKeyword, setFilterKeyword] = useState("");

  useEffect(() => {
    const newUnreadChatrooms: number[] = [...unreadChatrooms];
    chatSocket.listen("message", (data: ChatroomMessageData) => {
      const channelInfo = (data.isRoom ? data.receiverChannel : data.senderChannel);
      getAllChatrooms();
      if (unreadChatrooms.includes(channelInfo.channelId)) return;
      newUnreadChatrooms.push(channelInfo.channelId);
      setUnreadChatrooms(newUnreadChatrooms);
    });
    return () => chatSocket.removeListener("message");
  }, []);

  useEffect(() => {
    getAllChatrooms();
  }, [friends]);

  useEffect(() => {
    const newUnreadChatrooms: number[] = [...unreadChatrooms];
    chatrooms.forEach(chatroom => {
      if (chatroom.newMessage && !unreadChatrooms.includes(chatroom.channelId))
        newUnreadChatrooms.push(chatroom.channelId);
    });
    setUnreadChatrooms(newUnreadChatrooms);
  }, [chatrooms]);

  return (
    <div className={`relative ${expanded ? 'flex' : 'hidden'} flex-col flex-1 h-0 border-box`}>
      {chatrooms.length > 0
        ? displayChatroomListBody()
        : <ChatEmptyState />
      }
      {
        chatrooms.length > 0 &&
        <div className='absolute bottom-0 right-0 flex flex-row gap-x-3.5 mb-5 mr-5 bg-transparent'>
          <ChatButton icon={<HiServer />} title="join channel" onClick={() => setChatBody(<ChannelList />)} />
          <ChatButton icon={<FaPlusSquare />} title="new channel" onClick={() => setChatBody(<NewChannel />)} />
        </div>
      }
    </div>
  )

  // this includes the chatrooms from the database and the temporary chatrooms that are temporary stored in the local storage
  async function getAllChatrooms() {

    const chatrooms: ChatroomData[] = [];

    const chatroomsFromDb = await getChatroomList();
    if (chatroomsFromDb.data.length > 0) {
      chatrooms.push(...chatroomsFromDb.data);
    }
    setChatrooms(chatrooms);
  }

  function displayChatrooms() {
    let filteredChatrooms: ChatroomData[] = [];
    if (filterKeyword === "")
      filteredChatrooms = chatrooms;
    else {
      filteredChatrooms = chatrooms.filter(chatroom => {
        if (chatroom.channelName.toLowerCase().startsWith(filterKeyword.toLowerCase())
          || chatroom.owner?.intraName.toLowerCase().startsWith(filterKeyword.toLowerCase())
          || chatroom.owner?.userName.toLowerCase().startsWith(filterKeyword.toLowerCase()))
          return true;
        return false;
      })
    }

    if (filteredChatrooms.length === 0) return <FilteredChatroomEmptyState />;

    return filteredChatrooms.map(chatroom => {
      return <Chatroom key={chatroom.channelName + chatroom.channelId} chatroomData={chatroom} hasUnReadMsg={unreadChatrooms && unreadChatrooms.includes(chatroom.channelId)} />
    });
  }

  function displayChatroomListBody() {
    return (
      <div className='w-full h-full'>
        <div className='px-4 py-3'>
          <ChatTableTitle title={`Chatrooms`} searchable={true} setFilterKeyword={setFilterKeyword} />
        </div>
        <div className='w-full h-full overflow-y-scroll scrollbar-hide'>
          {displayChatrooms()}
        </div>
      </div>
    )
  }
}

export default ChatroomList