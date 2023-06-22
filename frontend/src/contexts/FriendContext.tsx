import { createContext } from "react";
import { FriendData } from "../model/FriendData";
import SocketApi from "../api/socketApi";

interface FriendsContextType {
  friendshipSocket: SocketApi,
  friends: FriendData[],
  setFriends: (updatedFriends: FriendData[]) => void;
}

export const FriendsContext = createContext<FriendsContextType>({
  friendshipSocket: new SocketApi(),
  friends: [],
  setFriends: () => { },
});

interface SeletectedFriendsContextType {
  friends: FriendData[],
  setFriends: (updatedFriends: FriendData[]) => void;
}

export const SelectedFriendContext = createContext<SeletectedFriendsContextType>({

  friends: [],
  setFriends: () => { },
})

export const FriendActionContext = createContext<string>("");

interface ActionCardsContextType {
  actionCards: JSX.Element[],
  selectedIndex: number,
  setSelectedIndex: (num: number) => void,
}


export const ActionCardsContext = createContext<ActionCardsContextType>({
  actionCards: [],
  selectedIndex: 0,
  setSelectedIndex: (num: number) => { },
});

interface ActionFunctionsContextType {
  yesAction: (name: string, show: boolean) => void,
  noAction: (name: string, show: boolean) => void,
  alternativeAction: (name: string, show: boolean) => void,
}

export const ActionFunctionsContext = createContext<ActionFunctionsContextType>({
  yesAction: (name: string, show: boolean) => { },
  noAction: (name: string, show: boolean) => { },
  alternativeAction: (name: string, show: boolean) => { },
})