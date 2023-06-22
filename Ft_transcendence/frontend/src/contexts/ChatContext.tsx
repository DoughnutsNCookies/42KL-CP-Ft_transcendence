import { createContext } from "react";
import SocketApi from "../api/socketApi";
import { ChatroomData, ChatroomMessageData, MemberData } from "../model/ChatRoomData";
import { NewChannelAction, NewChannelState, newChannelInitialState } from "../widgets/Chat/ChatroomBody/Channel/newChannelReducer";

interface ChatContextType {
  chatSocket: SocketApi,
  chatBody: JSX.Element,
  setChatBody: (newChatBody: JSX.Element) => void,
  expanded: boolean,
  activeInviteId: number,
}

export const ChatContext = createContext<ChatContextType>({
  chatSocket: new SocketApi("/chat"),
  chatBody: <></>,
  setChatBody: (newChatBody: JSX.Element) => { },
  expanded: false,
  activeInviteId: -1,
});

interface NewChannelContextType {
  state: NewChannelState,
  dispatch: React.Dispatch<NewChannelAction>,
}

export const NewChannelContext = createContext<NewChannelContextType>({
  state: newChannelInitialState,
  dispatch: () => { },
});

interface ChatroomContentContextType {
  chatroomContent: ChatroomData,
}

export const ChatroomContentContext = createContext<ChatroomContentContextType>({
  chatroomContent: {
    channelId: 0,
    channelName: "",
    isPrivate: false,
    isRoom: false,
    password: null,
    owner: null,
    newMessage: false,
    memberCount: 0,
  },
});

interface ChatroomMessagesContextType {
  messages: ChatroomMessageData[],
  setMessages: (newMessages: ChatroomMessageData[]) => void,
}

export const ChatroomMessagesContext = createContext<ChatroomMessagesContextType>({
  messages: [],
  setMessages: (newMessages: ChatroomMessageData[]) => { },
})

interface ChatMemberContextType {
  member: MemberData | null;
}

export const ChatMemberContext = createContext<ChatMemberContextType>({
  member: null,
});

interface ChatroomsContextType {
  unreadChatrooms: number[];
  setUnreadChatrooms: (newUnreadChatrooms: number[]) => void;
}

export const ChatroomsContext = createContext<ChatroomsContextType>({
  unreadChatrooms: [],
  setUnreadChatrooms: (newUnreadChatrooms: number[]) => { },
});
