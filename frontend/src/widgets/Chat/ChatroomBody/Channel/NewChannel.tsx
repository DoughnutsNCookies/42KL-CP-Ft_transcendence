import React, { useContext, useEffect, useMemo, useReducer, useState } from 'react'
import ChatNavbar from '../../ChatWidgets/ChatNavbar'
import ChatButton from '../../ChatWidgets/ChatButton'
import { FriendsContext } from '../../../../contexts/FriendContext'
import { ChatContext, NewChannelContext } from '../../../../contexts/ChatContext'
import ChatroomList from '../Chatroom/ChatroomList'
import { NewChannelState } from './newChannelReducer'
import NewChatInfo from './NewChatInfo'
import UserContext from '../../../../contexts/UserContext'
import { UserData } from '../../../../model/UserData'
import { FriendData } from '../../../../model/FriendData'
import ChannelMemberList from './ChannelMemberList'

interface NewChannelProps {
  oldState?: NewChannelState,
}

function NewChannel(props: NewChannelProps) {

  const { oldState } = props;
  const { state, dispatch } = useContext(NewChannelContext);
  const { setChatBody } = useContext(ChatContext);
  const { myProfile } = useContext(UserContext);
  const { friends } = useContext(FriendsContext);
  const acceptedFriendsUserData = useMemo(() => {
    const acceptedFriends: FriendData[] = friends.filter(friend => friend.status.toLowerCase() === 'accepted');
    const friendsUserData: UserData[] = acceptedFriends.map(friend => (myProfile.intraName === friend.sender.intraName ? friend.receiver : friend.sender));
    return friendsUserData;
  }, [friends]);

  useEffect(() => {
    // Select the user itself as the first member of the channel (owner)
    dispatch({ type: 'SELECT_MEMBER', userInfo: myProfile });
    dispatch({ type: 'ASSIGN_AS_OWNER', intraName: myProfile.intraName });
  }, []);

  return (
    <div className='w-full h-full'>
      <ChatNavbar
        title={`new channel`}
        nextComponent={<ChatButton title={state.members && (state.members.length === 1 ? `skip` : `next (${state.members.length - 1})`)} onClick={goToNextStep} />}
        backAction={backAction}
      />
      {acceptedFriendsUserData.length > 0 ? <ChannelMemberList title='friends' friendList={acceptedFriendsUserData} /> : displayNoFriends()}
    </div>
  )

  function displayNoFriends() {
    return (
      <div className='w-full h-full uppercase'>
        <div className='relative w-full h-full'>
          <p className='absolute font-extrabold text-center -translate-x-1/2 -translate-y-1/3 top-1/3 left-1/2 text-highlight'>No friends to choose from...</p>
        </div>
      </div>
    )
  }

  function backAction() {
    // When returning to the chatroom list, reset the new channel state
    setChatBody(<ChatroomList />);
    dispatch({ type: 'RESET' });
  }

  function goToNextStep() {
    // Go to the next step of the multiform
    dispatch({ type: 'RESET_ERRORS' });
    setChatBody(<NewChatInfo />);
  }
}

export default NewChannel