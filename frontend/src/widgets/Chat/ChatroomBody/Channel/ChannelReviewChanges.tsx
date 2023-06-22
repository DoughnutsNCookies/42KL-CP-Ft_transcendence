import React, { useContext, useEffect, useMemo, useState } from 'react'
import { NewChannelContext } from '../../../../contexts/ChatContext'
import { FaArrowRight, FaTimes } from 'react-icons/fa';
import { ModeratorAction, NewChannelState } from './newChannelReducer';

interface ChannelReviewChangesProps {
  previousChannelInfo: NewChannelState;
  isReviewingChanges: boolean;
  setIsReviewingChanges: (isReviewingChanges: boolean) => void;
}

enum ChangeType {
  CHANGED_CHANNEL_NAME,
  DISABLED_PASSWORD,
  ENABLED_PASSWORD,
  CHANGED_PASSWORD,
  CHANGED_CHANNEL_VISIBILITY,
  WRONG_PASSWORD,
  PROMOTE,
  DEMOTE,
  MUTE,
  UNMUTE,
  BAN,
  UNBAN,
  KICK,
}

function ChannelReviewChanges(props: ChannelReviewChangesProps) {

  const { previousChannelInfo, isReviewingChanges, setIsReviewingChanges } = props;
  const { state, dispatch } = useContext(NewChannelContext);
  const [opacity, setOpacity] = useState(0);
  const logsComponent = useMemo(generateChangesLogs, [state]);

  useEffect(() => {
    setOpacity(1);
  }, []);

  return (
    <div
      style={{opacity: `${opacity}`}}
      className='box-border relative flex flex-col w-full h-full p-3 overflow-hidden transition-opacity duration-700 rounded bg-highlight'>
      <div>
        <button className='absolute p-1 border-2 rounded border-dimshadow hover:bg-highlight hover:text-dimshadow aspect-square bg-dimshadow text-highlight' onClick={() => setIsReviewingChanges(!isReviewingChanges)} ><FaTimes /></button>
        <p className='text-lg font-extrabold w-fit mx-auto px-[1ch] text-center text-highlight bg-dimshadow'>CHANGES</p>
      </div>
      <div className='w-full h-full scrollbar-hide overflow-scroll box-border flex flex-col pt-[2ch] px-[1ch] text-xs'>
        {logsComponent}
      </div>
    </div>
  )

  function ChannelLog(type: ChangeType, memberName: string, previousValue: string, newValue: string) {
    switch (type) {
      case ChangeType.CHANGED_CHANNEL_NAME:
        return (<p key={type + Date.now()} className='flex flex-row items-center w-full font-bold whitespace-pre text-dimshadow'>- CHANGED CHANNEL NAME: <span className='bg-accCyan px-[1ch] text-highlight'>{previousValue}</span> to <span className='bg-accGreen px-[1ch] text-highlight'>{newValue}</span></p>)
      case ChangeType.DISABLED_PASSWORD:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accRed text-highlight'>DISABLED PASSWORD</span> </p>)
      case ChangeType.ENABLED_PASSWORD:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accGreen text-highlight'>ENABLED PASSWORD</span> </p>)
      case ChangeType.CHANGED_PASSWORD:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accRed text-highlight'>Password changed</span></p>)
      case ChangeType.CHANGED_CHANNEL_VISIBILITY:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- CHANGED CHANNEL VISIBILITY: <span className='bg-accCyan px-[1ch] text-highlight'>{previousValue}</span> to <span className='bg-accGreen px-[1ch] text-highlight'>{newValue}</span></p>)
      case ChangeType.PROMOTE:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accGreen text-highlight'>PROMOTED</span><span> {memberName}</span> as ADMIN</p>)
      case ChangeType.DEMOTE:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accRed text-highlight'>DEMOTED</span><span> {memberName}</span> as MEMBER</p>)
      case ChangeType.MUTE:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accRed text-highlight'>MUTED</span><span> {memberName}</span></p>)
      case ChangeType.UNMUTE:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accGreen text-highlight'>UNMUTED</span><span> {memberName}</span></p>)
      case ChangeType.BAN:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accRed text-highlight'>BANNED</span><span> {memberName}</span></p>)
      case ChangeType.UNBAN:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accGreen text-highlight'>UNBANNED</span><span> {memberName}</span></p>)
      case ChangeType.KICK:
        return (<p key={type + Date.now()} className='flex flex-row items-center font-bold whitespace-pre text-dimshadow'>- <span className='px-[1ch] bg-accRed text-highlight'>KICKED</span><span> {memberName}</span></p>)
      default:
        return (<></>)
    }
  }

  function generateChangesLogs() {
    const { channelName, password, newPassword, isPrivate, moderatedList } = state;
    const logs: JSX.Element[] = [];
  
    if (previousChannelInfo.channelName !== channelName) {
      logs.push(ChannelLog(ChangeType.CHANGED_CHANNEL_NAME, '', previousChannelInfo.channelName, channelName));
    }

    // if previously got password, then changed, cancel
    if (previousChannelInfo.password !== null && ((password === null) || (password === null && newPassword === null))) {
      logs.push(ChannelLog(ChangeType.DISABLED_PASSWORD, '', '', ''));
    }

    if (password !== null && newPassword !== null && password !== newPassword) {
      logs.push(ChannelLog(ChangeType.CHANGED_PASSWORD, '', '', ''));
    }

    if (previousChannelInfo.password === null && password !== null) {
      logs.push(ChannelLog(ChangeType.ENABLED_PASSWORD, '', '', ''));
    }

    if (previousChannelInfo.isPrivate !== isPrivate) {
      logs.push(ChannelLog(ChangeType.CHANGED_CHANNEL_VISIBILITY, '', previousChannelInfo.isPrivate ? 'Private' : 'Public', isPrivate ? 'Private' : 'Public'));
    }

    for (const moderated of moderatedList) {
      if (moderated.actionType === ModeratorAction.NONE) continue ;

      switch (moderated.actionType) {
        case ModeratorAction.PROMOTE:
          logs.push(ChannelLog(ChangeType.PROMOTE, moderated.memberInfo.memberInfo.userName, '', ''));
          break;
        case ModeratorAction.DEMOTE:
          logs.push(ChannelLog(ChangeType.DEMOTE, moderated.memberInfo.memberInfo.userName, '', ''));
          break;
        case ModeratorAction.MUTE:
          logs.push(ChannelLog(ChangeType.MUTE, moderated.memberInfo.memberInfo.userName, '', ''));
          break;
        case ModeratorAction.UNMUTE:
          logs.push(ChannelLog(ChangeType.UNMUTE, moderated.memberInfo.memberInfo.userName, '', ''));
          break;
        case ModeratorAction.BAN:
          logs.push(ChannelLog(ChangeType.BAN, moderated.memberInfo.memberInfo.userName, '', ''));
          break;
        case ModeratorAction.UNBAN:
          logs.push(ChannelLog(ChangeType.UNBAN, moderated.memberInfo.memberInfo.userName, '', ''));
          break;
        case ModeratorAction.KICK:
          logs.push(ChannelLog(ChangeType.KICK, moderated.memberInfo.memberInfo.userName, '', ''));
          break;
        default:
          break;
      }
    }

    if (logs.length > 0) {
      return (logs);
    }
    return ([
      <div key={"No_changes" + Date.now()} className='relative w-full h-full'>
        <p className='absolute text-sm font-bold text-center underline uppercase -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-dimshadow decoration-wavy decoration-accRed'>No changes were made</p>
      </div>
    ])
  }
}

export default ChannelReviewChanges