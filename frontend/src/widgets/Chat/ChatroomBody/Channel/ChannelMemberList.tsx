import React, { useContext, useEffect, useState } from 'react'
import ChatTableTitle from '../../ChatWidgets/ChatTableTitle'
import ChatMember from '../Chatroom/ChatMember'
import { UserData } from '../../../../model/UserData'
import { NewChannelContext } from '../../../../contexts/ChatContext'
import { FaMeh, FaUserPlus } from 'react-icons/fa'
import { ModeratorAction } from './newChannelReducer'

interface ChannelMemberListProps {
  isScrollable?: boolean,
  modifying?: boolean,
  viewingInviteList?: boolean,
  title: string,
  friendList?: UserData[],
}

function ChannelMemberListEmptyState() {
  return (
    <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-y-3 text-highlight mt-16'>
      <p className='text-center'>Hmmm... I don't know who that is</p>
      <FaMeh />
    </div>
  )
}

function ChannelMemberList(props: ChannelMemberListProps) {

  const { state, dispatch } = useContext(NewChannelContext);
  const { isScrollable = true, modifying, title, friendList, viewingInviteList = false } = props;
  const [filterKeyword, setFilterKeyword] = useState("");

  useEffect(() => {
  }, [filterKeyword]);

  return (
    <div className={`w-[95%] ${isScrollable && 'h-full'} mx-auto flex flex-col gap-y-2`}>
      <div className='sticky top-0 z-10 flex flex-col gap-y-2 bg-dimshadow'>
        <ChatTableTitle title={`${title} (${friendList === undefined ? state.members.length : friendList.length})`} searchable={true} setFilterKeyword={setFilterKeyword} />
        {(state.isOwner || state.isAdmin) && !viewingInviteList && !state.isNewChannel && <button className='flex flex-row items-center justify-center w-full p-2 text-xs font-extrabold uppercase transition-all duration-150 border-2 border-dashed gap-x-1 h-fit border-accCyan bg-dimshadow hover:bg-accCyan text-accCyan hover:text-highlight' onClick={() => dispatch({ type: 'TOGGLE_IS_INVITING', isInviting: true})}><FaUserPlus /> ADD FRIENDS</button>}
      </div>
      <div className='w-full h-full flex flex-col gap-y-2.5 scrollbar-hide scroll-smooth relative'>
        {displayMemberList()}
      </div>
    </div>
  )

  function displayMemberList() {

    if (friendList !== undefined) {

      const filteredFriendList = friendList.filter(friend => friend.intraName.toLowerCase().startsWith(filterKeyword.toLowerCase()) || friend.userName.toLowerCase().startsWith(filterKeyword.toLowerCase()));

      if (filteredFriendList.length === 0) {
        return <ChannelMemberListEmptyState />
      }

      if (state.isInviting) {
        return (filteredFriendList.map(friend => <ChatMember key={friend.intraId} selectable={true} userData={friend} />));
      }
      return (filteredFriendList.map(friend => <ChatMember key={friend.intraId} selectable={true} userData={friend} isSelected={state.members.find(member => member.memberInfo.intraName === friend.intraName) !== undefined}/>));
    }
    if (!state.isNewChannel) {
      // if is existing channel
      const owner = state.members.find(member => member.role === "owner"); // only one owner, so it's fine
      const admins = state.members.filter(member => member.role === "admin" && !member.isBanned).sort((a, b) => a.memberInfo.userName.localeCompare(b.memberInfo.userName));
      const members = state.members.filter(member => member.role === "member" && !member.isBanned).sort((a, b) => a.memberInfo.userName.localeCompare(b.memberInfo.userName));
      const banned = state.members.filter(member => member.isBanned).sort((a, b) => a.memberInfo.userName.localeCompare(b.memberInfo.userName));
      const memberList = [];
      if (owner !== undefined) {
        memberList.push(owner);
      }
      memberList.push(...admins);
      memberList.push(...members);
      memberList.push(...banned);

      const filteredMemberList = memberList.filter(member => member.memberInfo.intraName.toLowerCase().startsWith(filterKeyword.toLowerCase()) || member.memberInfo.userName.toLowerCase().startsWith(filterKeyword.toLowerCase()));

      if (filteredMemberList.length === 0) return <ChannelMemberListEmptyState />

      return (filteredMemberList.map(member => {
        const moderatedInfo = state.moderatedList.find((moderatedMember) => (moderatedMember.memberInfo.memberInfo.intraId === member.memberInfo.intraId));
        if (moderatedInfo !== undefined) {
          const { actionType } = moderatedInfo;
          if (actionType === ModeratorAction.DEMOTE) {
            return <ChatMember key={member.memberInfo.intraId} selectable={false} userData={member.memberInfo} memberRole={'member'} isModifyingMember={modifying} />
          } else if (actionType === ModeratorAction.PROMOTE) {
            return <ChatMember key={member.memberInfo.intraId} selectable={false} userData={member.memberInfo} memberRole={'admin'} isModifyingMember={modifying} />
          }
        }
        return <ChatMember key={member.memberInfo.intraId} selectable={false} userData={member.memberInfo} memberRole={member.role} isModifyingMember={modifying} /> 
      }));
    }
    // if is new channel
    const filteredMemberList = state.members.filter(member => member.memberInfo.intraName.toLowerCase().startsWith(filterKeyword.toLowerCase()) || member.memberInfo.userName.toLowerCase().startsWith(filterKeyword.toLowerCase()));
    if (filteredMemberList.length === 0) return <ChannelMemberListEmptyState />

    return (filteredMemberList.map(member => <ChatMember key={member.memberInfo.intraId} selectable={false} userData={member.memberInfo} memberRole={member.role} isModifyingMember={modifying} />));
  }
}

export default ChannelMemberList