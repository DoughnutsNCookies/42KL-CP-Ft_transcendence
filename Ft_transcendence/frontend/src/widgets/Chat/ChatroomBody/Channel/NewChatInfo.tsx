import React, { useContext, useEffect } from 'react'
import ChatNavbar from '../../ChatWidgets/ChatNavbar'
import ChatButton from '../../ChatWidgets/ChatButton'
import { ChatContext, NewChannelContext } from '../../../../contexts/ChatContext';
import NewChannel from './NewChannel';
import ChannelInfoForm from './ChannelInfoForm';
import ChannelMemberList from './ChannelMemberList';
import { NewChannelError } from './newChannelReducer';
import { createChannel, inviteMemberToChannel } from '../../../../api/chatAPIs';
import ChatroomList from '../Chatroom/ChatroomList';
import { ChannelData } from '../../../../model/ChatRoomData';

function NewChatInfo() {

  const { state, dispatch } = useContext(NewChannelContext);
  const { setChatBody } = useContext(ChatContext);

  return (
    <div className='flex flex-col'>
      <ChatNavbar
        title='channel info'
        backAction={() => setChatBody(<NewChannel />)}
        nextComponent={<ChatButton title='create' onClick={createNewChannel} />}
      />
      <ChannelInfoForm modifying={true} setModifyChannel={() => {}} />
      <div className='w-full h-full mt-6'>
        <ChannelMemberList title="members" />
      </div>
    </div>
  )

  async function inviteMember(channelData: ChannelData) {
    const { members } = state;
    const inviteErrors: number[] = [];

    const allMembers = members.filter(member => member.role !== 'owner');
    for (const member of allMembers) {
      const inviteResponse = await inviteMemberToChannel({
        channelId: channelData.channelId,
        intraName: member.memberInfo.intraName,
        isAdmin: member.role === 'admin',
        isBanned: false,
        isMuted: false,
        password: null,
      })
      if (inviteResponse.status !== 201) {
        inviteErrors.push(inviteResponse.status);
      }
    }
  }

  async function createNewChannel() {
    const { channelName, password, isPrivate } = state;
    let errorCount = 0;

    dispatch({ type: 'RESET_ERRORS' });

    if (!(channelName.length > 0 && channelName.length <= 16)) {
      dispatch({ type: 'ADD_ERROR', error: NewChannelError.INVALID_CHANNEL_NAME });
      errorCount++;
    }

    if (!isPrivate && password !== null && !(password.length > 0 && password.length <= 16)) {
      dispatch({ type: 'ADD_ERROR', error: NewChannelError.INVALID_PASSWORD });
      errorCount++;
    }

    if (errorCount !== 0) return;

    const createChannelResponse = await createChannel({
      channelName: state.channelName,
      password: state.password,
      isPrivate: state.isPrivate,
    });

    if (createChannelResponse.status === 201) {
      await inviteMember(createChannelResponse.data as ChannelData);
      dispatch({ type: 'RESET' });
      setChatBody(<ChatroomList />);
    }
  }
}

export default NewChatInfo