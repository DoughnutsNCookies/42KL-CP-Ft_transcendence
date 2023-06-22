import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { FaCaretDown, FaCheck, FaDoorOpen, FaDove, FaMinus, FaPlus, FaSkull, FaVolumeMute, FaWalking } from 'react-icons/fa'
import { FriendData } from '../../../../model/FriendData';
import UserContext from '../../../../contexts/UserContext';
import { UserData } from '../../../../model/UserData';
import { NewChannelContext } from '../../../../contexts/ChatContext';
import PreviewProfileContext from '../../../../contexts/PreviewProfileContext';
import Profile from '../../../Profile/Profile';
import { FriendsContext } from '../../../../contexts/FriendContext';
import { ModeratorAction } from '../Channel/newChannelReducer';
import { divide } from 'lodash';

interface MemberPrivilege {
  isMuted: boolean;
  isBanned: boolean;
}

interface ChatMemberProps {
  isModifyingMember?: boolean;
  isSelected?: boolean;
  selectable: boolean;
  userData: UserData,
  memberRole?: 'owner' | 'admin' | 'member';
  memberPrivilege?: MemberPrivilege;
}

interface ChatMemberRoleTagProps {
  isModifying?: boolean;
  role: 'owner' | 'admin' | 'member';
  userData: UserData;
}

function ChatMemberActions(props: { userData: UserData }) {

  const { userData } = props;
  const { state, dispatch } = useContext(NewChannelContext);
  const [currentStatus, setCurrentStatus] = useState('action');
  const [showOption, setShowOption] = useState(false);
  const [bgColor, setBgColor] = useState('bg-highlight');
  const memberInfo = useMemo(() => state.moderatedList.find(member => member.memberInfo.memberInfo.intraId === userData.intraId), [state.moderatedList]);

  useEffect(() => {
    if (memberInfo === undefined) return;
    if (memberInfo.memberInfo.isMuted) {
      setCurrentStatus('mute');
      setBgColor('bg-accCyan');
    } else if (memberInfo.memberInfo.isBanned) {
      setCurrentStatus('ban');
      setBgColor('bg-accRed');
    } else if (memberInfo.willBeKicked) {
      setCurrentStatus('kick');
      setBgColor('bg-accBriYellow');
    } else {
      setCurrentStatus('action');
      setBgColor('bg-dimshadow');
    }
  }, [state.moderatedList]);

  return (
    <div className='relative flex flex-row uppercase'>
      <button
        className={`${bgColor} text-highlight w-full gap-x-1 border border-highlight h-full p-1.5 flex flex-row items-center justify-center`}
        onClick={() => setShowOption(!showOption)}
        onBlur={() => setShowOption(false)}
      >
        <span className='text-sm font-thin uppercase'>{currentStatus}</span>
        <FaCaretDown />
      </button>
      <div className={`absolute right-0 z-10 flex-col items-center w-full h-fit ${showOption ? 'flex' : 'hidden'} text-sm uppercase`}>
        {!memberInfo?.memberInfo.isBanned && <button onMouseDown={toggleMuteMember} className={`border border-highlight ${memberInfo?.memberInfo.isMuted ? 'bg-highlight text-dimshadow font-bold' : 'bg-dimshadow text-highlight'} w-full hover:bg-highlight hover:text-dimshadow uppercase`}>{memberInfo?.memberInfo.isMuted ? 'unmute' : 'mute'}</button>}
        <button onMouseDown={toggleBanMember} className={`border border-highlight ${memberInfo?.memberInfo.isBanned ? 'bg-highlight text-dimshadow font-bold' : 'bg-dimshadow text-highlight'} w-full hover:bg-highlight hover:text-dimshadow uppercase`}>{memberInfo?.memberInfo.isBanned ? 'unban' : 'ban'}</button>
        {!memberInfo?.memberInfo.isBanned && <button onMouseDown={toggleKickMember} className={`border border-highlight ${memberInfo?.actionType === ModeratorAction.KICK ? 'bg-highlight text-dimshadow font-bold' : 'bg-dimshadow text-highlight'} w-full hover:bg-highlight hover:text-dimshadow uppercase`}>{memberInfo?.willBeKicked ? 'un-kick' : 'kick'}</button>}
      </div>
    </div>
  )

  function toggleMuteMember() {
    if (memberInfo === undefined) return;
    if (memberInfo.memberInfo.isMuted) {
      dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo.memberInfo, actionType: ModeratorAction.UNMUTE });
    } else {
      dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo.memberInfo, actionType: ModeratorAction.MUTE });
    }
  }

  function toggleBanMember() {
    if (memberInfo === undefined) return;
    if (memberInfo.memberInfo.isBanned) {
      dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo.memberInfo, actionType: ModeratorAction.UNBAN });
    } else {
      dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo.memberInfo, actionType: ModeratorAction.BAN });
    }
  }

  function toggleKickMember() {
    if (memberInfo === undefined) return;
    if (memberInfo.willBeKicked) {
      dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo.memberInfo, actionType: ModeratorAction.UNKICK});
    } else {
      dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo.memberInfo, actionType: ModeratorAction.KICK });
    }
  }
}

function ChatMemberRoleTag(props: ChatMemberRoleTagProps) {

  const { state, dispatch } = useContext(NewChannelContext);
  const { isModifying, role, userData } = props;
  const [isPressed, setIsPressed] = useState(false);
  const currentTimeRef = useRef<number>(0);
  const [gradientPosition, setGradientPosition] = useState(0);
  const isBanned = useMemo(() => {
    return state.members.find(member => member.memberInfo.intraId === userData.intraId)?.isBanned;
  }, []);

  if (isBanned) return null;

  if (role === 'member') {
    if (state.isNewChannel || (!state.isNewChannel && isModifying && state.isOwner)) {
      return (
        <div className='relative flex flex-row'>
          <div
            className={`absolute z-0 top-0 left-0 h-full transition-all ease-linear ${gradientPosition === 0 ? 'duration-150' : 'duration-1000'} bg-highlight`}
            style={{ width: `${gradientPosition}%` }}
          ></div>
          <button
            key={userData.intraName + "-member"}
            className={`mix-blend-difference w-[100%] z-[5] text-highlight overflow-hidden border-highlight border-2 border-dashed text-sm uppercase p-2 cursor-pointer flex flex-row items-center gap-x-2 transition-all duration-[3s]`}
            onMouseDown={confirmAction}
            onMouseUp={promoteMember}
          >
            {isPressed ? <FaMinus className='text-base' /> : <FaPlus className='text-base' />}
            <p>admin</p>
          </button>
        </div>
      )
    } else {
      return null;
    }
  }

  if (role === 'admin') {
    if (state.isNewChannel || (!state.isNewChannel && isModifying && state.isOwner)) {
      return (
        <div className='relative flex flex-row overflow-hidden'>
          <div
            className='absolute z-0 top-0 left-0 h-full transition-all ease-linear duration-[1s] bg-highlight'
            style={{ width: `${gradientPosition}%` }}
          ></div>
          <button
            key={userData.intraName + "-admin"}
            className={`w-[100%] z-[5] overflow-hidden bg-highlight text-dimshadow border-highlight border-2 border-dashed text-sm uppercase p-2 cursor-pointer flex flex-row items-center gap-x-2 transition-all duration-100`}
            onClick={demoteMember}
          >
            <FaMinus className='text-base' />
            <p>admin</p>
          </button>
        </div>
      )
    } else {
      return (
        <div className='flex flex-row'>
          <button key={userData.intraName + "-admin"} className={`cursor-default w-[100%] z-[5] overflow-hidden bg-highlight text-dimshadow border-highlight border-2 border-dashed text-sm uppercase p-2 flex flex-row items-center gap-x-2 transition-all duration-100`}>
            <p>admin</p>
          </button>
        </div>
      )
    }
  }

  if (role === 'owner') {
    return (
      <div className='p-2 text-sm uppercase bg-accCyan text-highlight'>
        <p>{role}</p>
      </div>
    )
  }

  return null;

  function confirmAction() {
    setGradientPosition(100);
    currentTimeRef.current = Date.now();
  }

  function promoteMember() {
    const currentTime = Date.now();
    const timeDifference = currentTime - currentTimeRef.current;

    if (timeDifference < 1000) {
      setGradientPosition(0);
      return;
    }
    if (timeDifference >= 1000) {
      if (!state.isNewChannel && (state.isOwner || state.isAdmin)) {
        const memberInfo = state.members.find(member => member.memberInfo.intraId === userData.intraId);
        if (!memberInfo) return;
        dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo, actionType: ModeratorAction.PROMOTE })
      } else {
        dispatch({ type: 'ASSIGN_AS_ADMIN', intraName: userData.intraName });
      }
    }
    currentTimeRef.current = currentTime;
  }

  function demoteMember() {
    setGradientPosition(0);
    if (!state.isNewChannel && (state.isOwner || state.isAdmin)) {
      const memberInfo = state.members.find(member => member.memberInfo.intraId === userData.intraId);
      if (!memberInfo) return;
      dispatch({ type: 'MODERATOR_ACTION', moderatedMemberInfo: memberInfo, actionType: ModeratorAction.DEMOTE })
    } else {
      dispatch({ type: 'ASSIGN_AS_MEMBER', intraName: userData.intraName });
    }
  }
}

function ChatMemberModeratedStatus(props: {userData: UserData}) {

  const { userData } = props;
  const { state } = useContext(NewChannelContext);
  const [isBanned, setIsBanned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const memberInfo = state.members.find(member => member.memberInfo.intraId === userData.intraId);
    if (!memberInfo) return;
    setIsBanned(memberInfo.isBanned);
    setIsMuted(memberInfo.isMuted);
  })

  return (
    <div className='h-full text-highlight text-sm w-[60%] flex flex-row gap-x-4 justify-end'>
      {isBanned && <FaSkull />}
      {isMuted && <FaVolumeMute />}
    </div>
  )
}

function ChatMember(props: ChatMemberProps) {

  const { isModifyingMember, selectable, userData, memberRole } = props;
  const { myProfile } = useContext(UserContext);
  const { state, dispatch } = useContext(NewChannelContext);
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);
  const [isSelected, setIsSelected] = useState(props.isSelected || false);
  const { friends } = useContext(FriendsContext);
  const isBlocked = useMemo(checkIfFriendIsBlocked, [friends]);

  return (
    <div
      className='flex flex-row items-center justify-between w-full transition-all duration-75 ease-in-out'
      onClick={handleSelectMember}
    >
      <div className={`flex flex-row w-fit items-center gap-x-4 ${selectable ? 'group cursor-pointer' : 'cursor-default'}`}>
        <div className='relative object-cover w-10 aspect-square'>
          <img
            className='object-cover w-full aspect-square'
            src={userData.avatar}
            alt={userData.userName + ' avatar'}
          />
          <div className={`absolute w-full h-full bg-dimshadow/80 top-0 ${isSelected ? 'block' : 'hidden group-hover:block'} transition-all duration-150 ease-in-out p-3 group`}>
            <FaCheck className={`text-lg text-highlight ${!isSelected && 'group-hover:invisible'}`} />
          </div>
        </div>
        <button className={`text-sm font-bold ${isSelected ? 'text-highlight' : 'text-highlight/50'} transition-all duration-150 ease-in-out ${isBlocked && 'cursor-default'} whitespace-pre ${!state.isNewChannel && 'hover:text-highlight'}`} disabled={isBlocked} onClick={viewUserProfile}>{userData.userName} ({userData.intraName})</button>
      </div>
      <div className={`flex flex-row items-center w-[30%] justify-between`}>
        <div>
          {memberRole !== "owner" && memberRole !== "admin" && state.isAdmin && isModifyingMember && <ChatMemberActions userData={userData} />}
          {memberRole !== "owner" && myProfile.intraId !== userData.intraId && state.isOwner && isModifyingMember && <ChatMemberActions userData={userData} />}
        </div>
        {!state.isNewChannel && !isModifyingMember && memberRole !== "owner" && <ChatMemberModeratedStatus userData={userData} />}
        <div className='flex flex-row items-center justify-end w-[50%]'>
          {memberRole !== undefined && <ChatMemberRoleTag isModifying={isModifyingMember} userData={userData} role={memberRole} />}
        </div>
      </div>
    </div>
  )

  function checkIfFriendIsBlocked() {
    const friendRelationship = friends.find(friend => friend.sender.intraName === userData.intraName || friend.receiver.intraName === userData.intraName);
    if (friendRelationship === undefined) return false;
    if (friendRelationship.status.toLowerCase() === 'blocked') return true;
    return false;
  }

  function viewUserProfile() {
    if (state.isNewChannel) return;
    if (isBlocked) return;
    setPreviewProfileFunction(userData);
    setTopWidgetFunction(<Profile expanded={true} />);
  }

  function handleSelectMember() {
    if (!selectable) return;

    setIsSelected(!isSelected);
    // to handle invite member to existing channel
    if (state.isInviting) {
      if (isSelected)
        dispatch({ type: 'REMOVE_INVITE', userInfo: userData });
      else
        dispatch({ type: 'INVITE_MEMBER', userInfo: userData });
      return;
    }
    // to handle add member to new channel
    if (isSelected)
      dispatch({ type: 'DESELECT_MEMBER', userInfo: userData });
    else
      dispatch({ type: 'SELECT_MEMBER', userInfo: userData });
  }
}

export default ChatMember