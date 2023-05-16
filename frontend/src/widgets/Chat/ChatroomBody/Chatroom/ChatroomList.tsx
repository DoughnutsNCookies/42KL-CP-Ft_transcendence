import React, { useContext } from 'react'
import Chatroom from './Chatroom'
import ChatButton from '../../ChatWidgets/ChatButton'
import { HiServer } from 'react-icons/hi';
import { FaPlusSquare } from 'react-icons/fa'
import ChatEmptyState from '../../ChatEmptyState';
import NewChatRoom from '../CreateChat/NewChatRoom';
import { ChatContext, ChatroomsContext } from '../../../../contexts/ChatContext';
import { getChatroomList } from '../../../../functions/chatAPIs';
import { ChatroomData, ChatroomMessageData } from '../../../../model/ChatRoomData';
import { FriendsContext } from '../../../../contexts/FriendContext';

function ChatroomList() {

  const { chatSocket } = useContext(ChatContext);
  const { unreadChatrooms, setUnreadChatrooms } = useContext(ChatroomsContext);
  const { friends } = useContext(FriendsContext);
  const { setChatBody } = useContext(ChatContext);
  const [chatrooms, setChatrooms] = useState<ChatroomData[]>([]);

  useEffect(() => {
    const newUnreadChatrooms: number[] = [...unreadChatrooms];
    chatSocket.listen("message", (data: ChatroomMessageData) => {
      if (unreadChatrooms.includes(data.senderChannel.channelId)) return;
      newUnreadChatrooms.push(data.senderChannel.channelId);
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
    <div className='relative flex flex-col overflow-y-scroll scrollbar-hide border-box h-full'>
      {<ChatEmptyState /> ||
        <>
          <Chatroom />
          <div className='absolute bottom-0 right-0 flex flex-row gap-x-3.5 mb-5 mr-5'>
            <ChatButton icon={<HiServer />} title="join channel" />
            <ChatButton icon={<FaPlusSquare />} title="new channel" onClick={() => setChatBody(<NewChatRoom type='channel' />)} />
            <ChatButton icon={<FaPlusSquare />} title="new chat" onClick={() => setChatBody(<NewChatRoom type='dm' />)} />
          </div>
        </>
      }
    </div>
  )
<<<<<<< HEAD
=======

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
    return chatrooms.map(chatroom => <Chatroom key={chatroom.channelName + chatroom.channelId} chatroomData={chatroom} hasUnReadMsg={unreadChatrooms && unreadChatrooms.includes(chatroom.channelId)} />);
  }
>>>>>>> 2ff5f774372f609a14351f6876ad82806f3ee235
}

export default ChatroomList