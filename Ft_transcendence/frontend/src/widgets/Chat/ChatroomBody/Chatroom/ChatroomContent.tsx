import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import ChatroomHeader from './ChatroomHeader'
import ChatroomTextField from './ChatroomTextField'
import { ChannelData, ChatroomData, ChatroomMessageData, MemberData } from '../../../../model/ChatRoomData';
import { getChannelMemberData, getChatroomMessages, getMemberData } from '../../../../api/chatAPIs';
import ChatroomMessage from './ChatroomMessage';
import UserContext from '../../../../contexts/UserContext';
import { ChatContext, ChatroomMessagesContext, ChatroomsContext, NewChannelContext } from '../../../../contexts/ChatContext';
import { playNewMessageSound } from '../../../../functions/audio';
import ChatUnreadSeparator from './ChatUnreadSeparator';
import { FaTimes, FaUsers } from 'react-icons/fa';
import ChatButton from '../../ChatWidgets/ChatButton';
import ChannelMemberOnlineList from '../Channel/ChannelMemberOnlineList';
import { ErrorData } from '../../../../model/ErrorData';
import ChatroomList from './ChatroomList';
import { gameData } from '../../../../main';
import { ErrorPopup } from '../../../../components/Popup';
import { set } from 'lodash';

interface ChatroomContentProps {
  chatroomData: ChatroomData;
}

const MESSAGE_FETCH_LIMIT = 50;

// append new message but to the top of the list (index 0)
export function appendNewMessage(newMessage: ChatroomMessageData, messages: ChatroomMessageData[]) {
  const newMessages = [newMessage, ...messages];
  return newMessages;
}

function ChatroomContent(props: ChatroomContentProps) {

  const { chatroomData } = props;
  const { unreadChatrooms, setUnreadChatrooms } = useContext(ChatroomsContext);
  const { chatSocket, setChatBody, activeInviteId } = useContext(ChatContext);
  const { myProfile } = useContext(UserContext);
  const [allMessages, setAllMessages] = useState<ChatroomMessageData[]>([]);
  const [isMessagesSet, setIsMessagesSet] = useState<boolean>(false);
  const [chatMemberLastRead, setChatMemberLastRead] = useState<string>('');
  const scrollToHereRef = useRef<HTMLDivElement>(null);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [canBeFetched, setCanBeFetched] = useState<boolean>(true);
  const [isAtTop, setIsAtTop] = useState<boolean>(false);
  const [viewMemberList, setViewMemberList] = useState<boolean>(false);
  const { state, dispatch } = useContext(NewChannelContext);
  const [unableToCreateInvite, setUnableToCreateInvite] = useState(false);
  const [unableToAcceptInvite, setUnableToAcceptInvite] = useState(false);
  const [unableToSendMessage, setUnableToSendMessage] = useState(false);

  useEffect(() => {
    gameData.setUnableToCreateInvite = setUnableToCreateInvite;
    gameData.setUnableToAcceptInvite = setUnableToAcceptInvite;

    // pop off this channel id from the list of unread channels
    if (unreadChatrooms.includes(chatroomData.channelId)) {
      const newUnreadChatrooms = unreadChatrooms.filter((channelId) => channelId !== chatroomData.channelId);
      setUnreadChatrooms(newUnreadChatrooms);
    }
    // fetch message history
    fetchMessageHistory();
    // get my last read
    getMyLastRead();
    // fetch chat members
    fetchChatMembers();
    // listen for incoming messages
    listenForIncomingMessages();
    // use to listen if the user scrolls up to the top of the chat
    const scrollableDiv = scrollableDivRef.current;
    scrollableDiv?.addEventListener('scroll', handleScrollToTop);

    return () => {
      chatSocket.removeListener("message");
      scrollableDiv?.removeEventListener('scroll', handleScrollToTop);
    }
  }, []);

  useEffect(() => {
    const amIMuted = state.members.find((member) => member.memberInfo.intraId === myProfile.intraId)?.isMuted;
    if (amIMuted) setUnableToSendMessage(true);
  }, [state.members]);

  useEffect(() => {
    if (isFirstLoad) return;

    if (unableToCreateInvite) {
      const timeoutId = setTimeout(() => {
        setUnableToCreateInvite(false);
      }, 3000);
      
      return () => {
        clearTimeout(timeoutId);
      }
    }

  }, [unableToCreateInvite]);

  useEffect(() => {
    if (isFirstLoad) return;

    if (unableToAcceptInvite) {
      const timeoutId = setTimeout(() => {
        setUnableToAcceptInvite(false);
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      }
    }
  }, [unableToAcceptInvite])

  useEffect(() => {
    if (hasNewMessage) {
      scrollToHereRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      setHasNewMessage(false);
    }
  }, [hasNewMessage]);

  useEffect(() => {
    fetchMessageHistory();
  }, [isAtTop]);

  const messagesComponent = useMemo(() => {
    if (!chatMemberLastRead) return;
    return displayAllMessages();
  }, [allMessages.length, chatMemberLastRead]);

  return (
    <ChatroomMessagesContext.Provider value={{ messages: allMessages, setMessages: setAllMessages }}>
      <div className='box-border relative flex flex-col flex-1 w-full h-0'>
        <ChatroomHeader chatroomData={chatroomData} viewMemberListButton={ViewMemberOnlineListButton}/>
        { (unableToCreateInvite || unableToAcceptInvite) && (
            <div className='absolute top-10 right-0 z-[60]'>
              <ErrorPopup text={unableToAcceptInvite ? 'Invitation not found :(' : `Failed to create invite :(`} />
            </div>
          )
        }
        <div className='box-border flex flex-col-reverse h-full px-5 pb-4 overflow-y-scroll scrollbar-hide gap-y-4 scroll-smooth' ref={scrollableDivRef}>
          {messagesComponent}
        </div>
        {viewMemberList && <ChannelMemberOnlineList />}
        {unableToSendMessage ? (
          <div className='w-full p-4'>
            <p className='bg-highlight text-dimshadow px-[1ch] w-fit mx-auto uppercase font-extrabold'>read-only</p>
          </div>
        ) : (
          <ChatroomTextField chatroomData={chatroomData} pingServer={pingServerToUpdateLastRead} setIsFirstLoad={setIsFirstLoad}/>
        )}
      </div>
    </ChatroomMessagesContext.Provider>
  )

  function ViewMemberOnlineListButton() {
    return (
      <div className='z-50 transition-all duration-150'>
        <ChatButton icon={viewMemberList ? <FaTimes /> : <FaUsers />} title={viewMemberList ? undefined : "members"} onClick={() => setViewMemberList(!viewMemberList)}/>
      </div>
    )
  }
  
  function setChannelInfo(members: MemberData[]) {
    if (!chatroomData.isRoom) return;
    dispatch({ type: 'SET_CHANNEL_INFO', chatroomData: chatroomData, members: members});
  }

  function handleScrollToTop() {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      const isAtTop = (scrollableDiv.scrollHeight - scrollableDiv.clientHeight + scrollableDiv.scrollTop) === 0;
      setIsAtTop(isAtTop);
    }
  }

  async function fetchChatMembers() {
    if (!chatroomData.isRoom) return;

    const members = (await getChannelMemberData(chatroomData.channelId)).data as MemberData[];
    setChannelInfo(members);
  }

  async function fetchMessageHistory() {

    if (!canBeFetched) return;

    try {
      const fetchResult: ChatroomMessageData[] = (await getChatroomMessages(chatroomData.channelId, MESSAGE_FETCH_LIMIT, page)).data;
      if (fetchResult.length < MESSAGE_FETCH_LIMIT) {
        setCanBeFetched(false);
      }
      const allMessagesArray = [...fetchResult, ...allMessages];
      const sortedMsgs = allMessagesArray.sort((b, a) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime());
      setAllMessages(sortedMsgs);
      setIsMessagesSet(true);
      setPage(page + 1);
    } catch (error: any) {
      const errorMessage = (error.response.data as ErrorData);
      if (errorMessage) {
        if (errorMessage.error === "Invalid channelId - channel does not exist") {
          setChatBody(<ChatroomList />);
          dispatch({ type: 'RESET' });
        }
      }
    }
  }

  async function getMyLastRead() {
    
    const memberData = (await getMemberData(chatroomData.channelId)).data as MemberData;
    setChatMemberLastRead(memberData.lastRead);
  }

  function pingServerToUpdateLastRead() {
    chatSocket.sendMessages("read", { channelId: chatroomData.channelId });
  }

  function listenForIncomingMessages() {
    chatSocket.listen("message", (newMessage: ChatroomMessageData) => {
      const { senderChannel, receiverChannel } = newMessage;
      if (receiverChannel.isRoom && !chatroomData.isRoom) return;
      if (senderChannel.owner.intraId === myProfile.intraId && newMessage.message === "/invite" && receiverChannel.channelId === chatroomData.channelId) {
        setAllMessages((messages) => appendNewMessage(newMessage, messages));
        return;
      }
      if (!chatroomData.isRoom && senderChannel.channelId !== chatroomData.channelId) return;
      if (chatroomData.isRoom && receiverChannel.channelId !== chatroomData.channelId) return;
      setAllMessages((messages) => appendNewMessage(newMessage, messages));
    });
  }

  function displayAllMessages() {

    if (chatMemberLastRead === '' || !isMessagesSet) return [];

    const chatMemberLastReadTime = new Date(chatMemberLastRead);
    const oldMessages: ChatroomMessageData[] = allMessages.filter((message) => new Date(message.timeStamp) < chatMemberLastReadTime);
    const newMessages: ChatroomMessageData[] = allMessages.filter((message) => new Date(message.timeStamp) >= chatMemberLastReadTime);
    const messagesComponent: JSX.Element[] = [];
    let messageToDisplay: (string | ChatroomMessageData)[] = [];

    // if there's a new message, display a separator
    if (newMessages.length > 0 && isFirstLoad) {
      messageToDisplay = [...newMessages, "new", ...oldMessages];
    } else if (newMessages.length > 0 && !isFirstLoad) {
      messageToDisplay = [...newMessages, ...oldMessages];
    } else {
      messageToDisplay = oldMessages;
      setIsFirstLoad(false);
    }

    messageToDisplay.forEach((message) => {
      if (typeof message === "string" && message === "new") {
        messagesComponent.push(<div ref={scrollToHereRef} key={"separator_div" + new Date().toDateString()}><ChatUnreadSeparator key={"separator" + new Date().toISOString()} /></div>);
        setHasNewMessage(true);
      } else if (typeof message === "object")
        messagesComponent.push(<ChatroomMessage key={message.messageId + new Date().toDateString()} messageData={message} isMyMessage={myProfile.intraName === message.senderChannel.owner.intraName} />);
    }
    );
    pingServerToUpdateLastRead();
    return messagesComponent;
  }
}

export default ChatroomContent