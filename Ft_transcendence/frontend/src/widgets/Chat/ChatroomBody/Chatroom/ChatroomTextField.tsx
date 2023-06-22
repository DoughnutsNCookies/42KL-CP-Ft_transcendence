import React, { useContext, useEffect, useMemo, useState } from 'react'
import { FaPaperPlane, FaGamepad, FaPlusCircle } from 'react-icons/fa'
import { ChatContext, ChatroomMessagesContext, NewChannelContext } from '../../../../contexts/ChatContext';
import { ChannelData, ChatroomData, ChatroomMessageData } from '../../../../model/ChatRoomData';
import UserContext from '../../../../contexts/UserContext';
import ChatroomTypingStatus from './ChatroomTypingStatus';
import { gameData } from '../../../../main';

interface ChatroomTextFieldProps {
  chatroomData: ChatroomData;
  pingServer: () => void;
  setIsFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
}

enum MessageType {
  MESSAGE,
  INVITE
}

function ChatroomTextField(props: ChatroomTextFieldProps) {

  const { chatroomData, pingServer, setIsFirstLoad } = props;
  const { chatSocket } = useContext(ChatContext);
  const { messages, setMessages } = useContext(ChatroomMessagesContext);
  const { state } = useContext(NewChannelContext);
  const { myProfile } = useContext(UserContext);
  const [previousRows, setPreviousRows] = useState(1);
  const [rows, setRows] = useState(1);
  const [message, setMessage] = useState('');
  const [isFocusing, setIsFocusing] = useState(false);
  const [textTooLong, setTextTooLong] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [someoneIsTyping, setSomeoneIsTyping] = useState(false);
  const [typingMembers, setTypingMembers] = useState<string[]>([]);
  const [inviteCreated, setInviteCreated] = useState(false);
  const [canCreateInvite, setCanCreateInvite] = useState(false); // use to check if user can create invite

  useEffect(() => {

    chatSocket.listen("message", (newMessage: ChatroomMessageData) => {
      if (newMessage.senderChannel.owner.intraId === myProfile.intraId && newMessage.message === "/invite") {
        gameData.updateInviteId(newMessage.messageId);
        createGameLobby(newMessage.messageId);
      }
    });

    gameData.setCanCreateInvite = setCanCreateInvite;
    gameData.setInviteCreated = setInviteCreated;

    return (() => {
      chatSocket.removeListener("message");
    });
  }, []);

  useEffect(() => {
    // if user can create invite, send invite
    if (canCreateInvite) {
      sendInvite();
      setCanCreateInvite(false);
    }
  }, [canCreateInvite]);

  useEffect(() => {
    // listen for member typing
    listenForMemberTyping();
    return () => {
      chatSocket.removeListener("typing");
    }
  }, [typingMembers]);

  useEffect(() => {
    if (textTooLong) {
      const timeoutId = setTimeout(() => {
        setTextTooLong(false);
      }, 800);

      return (() => {
        clearTimeout(timeoutId);
      });
    }
  }, [textTooLong]);

  useEffect(() => {
    if (isTyping || message.length === 0) return;

    if (!isTyping) setIsTyping(true);
    chatSocket.sendMessages("typing", { channelId: chatroomData.channelId });
  }, [message]);

  useEffect(() => {
    if (isTyping) {
      const timeoutId = setTimeout(() => {
        setIsTyping(false);
      }, 5000);

      return (() => {
        clearTimeout(timeoutId);
      });
    }
  }, [isTyping]);

  useEffect(() => {
    if (someoneIsTyping) {
      const timeoutId = setTimeout(() => {
        setTypingMembers(prevTypingMembers => {
          const updatedTypingMembers = prevTypingMembers.slice(1);
          if (updatedTypingMembers.length === 0) setSomeoneIsTyping(false);
          return updatedTypingMembers;
        });
      }, 5000);

      return (() => {
        clearTimeout(timeoutId);
      });
    }
  }, [someoneIsTyping, typingMembers]);

  const listenForMemberTyping = () => {
    chatSocket.listen("typing", (data: { channel: ChannelData, userName: string }) => {
      // if current chatroom is a room, the channel is the typist's channel
      // if current chatroom is a DM, the channel is the sender's channel
      const { channel, userName } = data;
      if (chatroomData.channelId !== channel.channelId) return;
      if (typingMembers.includes(userName)) return;
      // preventing race condition
      setTypingMembers(prevTypingMembers => [...prevTypingMembers, userName]);
      setSomeoneIsTyping(true);
    })
  }

  // use to check if the current user can create invite
  const canCurrentUserCreateInvite = () => {
    gameData.checkCreateInvite();
  }

  // the actual function to create invite
  const createGameLobby = (messageId: number) => {
    // DM: receiver's name
    // GROUPCHAT: group's name
    const targetChannel = chatroomData.isRoom ? chatroomData.channelName : chatroomData.owner!.intraName;
    gameData.createInvite(myProfile.intraName, targetChannel, messageId);
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { scrollHeight, clientHeight, value } = e.target;

    if (value.length > 1024) {
      setMessage(value.slice(0, 1024));
      setTextTooLong(true);
      return;
    };

    if (value === '') {
      setRows(1);
      setPreviousRows(1);
      setMessage(value);
      return;
    }

    if (scrollHeight > clientHeight) {
      const newRows = rows === 3 ? 3 : rows + 1;
      setRows(newRows);
      setPreviousRows(newRows);
    }
    setMessage(value);
  }

  const sendMessageDataToServer = (message: string) => {
    chatSocket.sendMessages("message", {
      channelId: chatroomData.channelId,
      message: message,
    });
  }

  const sendInvite = () => {
    if (!canCreateInvite) {
      canCurrentUserCreateInvite();
      return;
    }
    sendMessageDataToServer("/invite");
    setMessage('');
    setRows(1);
    setIsFirstLoad(false);
    pingServer();
  }

  const sendMessage = () => {

    if (message === '' || message.length === 0) return;

    sendMessageDataToServer(message);

    // append new message to the top of the list (index 0)
    const newMessage: ChatroomMessageData = {
      senderChannel: {
        owner: myProfile,
        channelName: myProfile.intraName,
        isPrivate: true,
        isRoom: false,
        channelId: myProfile.intraId,
        password: null
      },
      receiverChannel: {
        owner: chatroomData.owner!,
        channelName: chatroomData.channelName,
        isPrivate: chatroomData.isPrivate,
        isRoom: chatroomData.isRoom,
        channelId: chatroomData.channelId,
        password: chatroomData.password,
      },
      isRoom: chatroomData.isRoom,
      message: message,
      messageId: new Date().getTime(),
      timeStamp: new Date().toISOString(),
    };
    const newMessages = [
      newMessage,
      ...messages,
    ];
    setMessages(newMessages);
    setMessage('');
    setRows(1);
    setIsFirstLoad(false);
    pingServer();
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message === "/invite") {
        sendInvite();
        return;
      }
      sendMessage();
    }
  }

  return (
    <div className='w-full h-[60px] flex flex-row bg-dimshadow/0 items-end'>
      <div className='w-[80%] h-full flex flex-row relative'>
        {isFocusing && <span className={`text-xs ${message.length === 1024 || textTooLong ? 'bg-accRed text-highlight' : 'bg-highlight text-dimshadow'} h-fit px-[1ch] font-bold absolute -top-3 right-16`}>{textTooLong ? "TEXT TOO LONG!" : `${message.length}/1024`}</span>}
        {
          someoneIsTyping &&
          <div className='absolute -top-4'>
            <ChatroomTypingStatus typingMembers={typingMembers} />
          </div>
        }
        <textarea
          className='flex-1 p-3 text-xl whitespace-pre-line border-4 border-b-0 border-l-0 outline-none resize-none border-highlight bg-dimshadow text-highlight scrollbar-hide cursor-text selection:bg-highlight selection:text-dimshadow'
          rows={rows}
          value={message}
          onBlur={() => { setRows(1); setIsFocusing(false); }}
          onFocus={() => { setRows(previousRows); setIsFocusing(true); }}
          onChange={handleInput}
          onKeyDown={handleKeyPress}
        >
        </textarea>
        <button className='w-[60px] bg-highlight rounded-tr-md p-4 cursor-pointer' onClick={() => message === "/invite" ? sendInvite() : sendMessage()}>
          <FaPaperPlane className='w-full h-full -ml-1 text-3xl text-dimshadow aspect-square' />
        </button>
      </div>
      <div className='w-[20%] h-[60px] px-4 bg-dimshadow'>
        <button className='bg-highlight w-full h-[60px] rounded-t-md px-3 cursor-pointer' onClick={() => sendInvite()}>
          <span className='relative w-fit h-fit'>
            <FaGamepad className='w-fit h-full text-[53px] mx-auto text-dimshadow' />
            <span className='absolute z-20 flex flex-row h-5 rounded-full bg-highlight aspect-square bottom-3 right-1 justify-evenly'>
              <FaPlusCircle className='h-full rounded-full w-fullaspect-square text-accGreen' />
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export default ChatroomTextField