import React, { useContext, useMemo, useState } from 'react'
import { FriendData } from '../../../model/FriendData'
import { getRandomString } from '../../../functions/fun';
import FriendlistEmptyLine from '../Friendlist/FriendlistEmptyLine';
import { UserData } from '../../../model/UserData';
import { ActionCardsContext, FriendActionContext } from '../../../contexts/FriendContext';
import FriendActionProfileCard from './FriendActionProfileCard';
import FriendActionConfirmationButtons from './FriendActionConfirmationButtons';
import FriendActionConfirmation from './FriendActionConfirmation';

interface FriendActionCardProps {
  index: number;
  friend: FriendData;
  user: UserData;
  ignoreAction: () => void;
}

export const ACTION_TYPE = {
  ACCEPT: "accept",
  ADD: "add",
  BLOCK: "block",
  UNFRIEND: "unfriend",
  UNBLOCK: "unblock",
  VIEW: "view",
}

function getFriendActionTitle(action: string) {
  if (action === ACTION_TYPE.ACCEPT)
    return "You have received a friend request from "
  return `You are about to ${action} `
}

function FriendActionCard(props: FriendActionCardProps) {

  const action = useContext(FriendActionContext);
  const { selectedIndex } = useContext(ActionCardsContext);
  const { index, user, friend, ignoreAction } = props;
  const fakeSHAkeyStr = useMemo(() => `+${getRandomString(10)}/${getRandomString(10)}`, []);
  const isCurrentIndex = selectedIndex === index;
  const friendInfo = (user.intraName === friend.receiver.intraName ? friend.sender : friend.receiver);
  // let friendIntraName = (user.intraName === friend.receiver.intraName ? friend.sender.intraName : friend.receiver.intraName);

  return (
    <div className={`flex flex-row gap-x-2 ${!isCurrentIndex && 'opacity-20'}`}>
      <p className='w-[3ch] text-right font-extrabold text-highlight/50 overflow-hidden text-sm'>{index}</p>
      <div className='flex flex-col'>
        <FriendActionProfileCard isCurrentIndex={isCurrentIndex} friendInfo={friendInfo} friendshipStatus={friend.status} />
        <FriendlistEmptyLine />
        <div className='flex flex-col w-full text-base text-highlight'>
          <p>{getFriendActionTitle(action)}'<span className='select-all bg-accCyan'>{friendInfo.userName}</span>'</p>
          <p>PONGSH key fingerprint is SHA256: {fakeSHAkeyStr}</p>
          <div className='flex flex-row whitespace-pre'>
            <FriendActionConfirmation />
          </div>
        </div>
        <FriendlistEmptyLine />
      </div>
    </div>
  )
}

export default FriendActionCard