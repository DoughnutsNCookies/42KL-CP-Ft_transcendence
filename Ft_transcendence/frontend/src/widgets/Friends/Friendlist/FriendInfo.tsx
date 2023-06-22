import React, { useContext, useEffect, useMemo, useState } from 'react'
import FriendlistSeparator from './FriendlistSeparator'
import FriendlistTag from './FriendlistTag'
import { FriendData } from '../../../model/FriendData'
import SocketApi from '../../../api/socketApi';
import PreviewProfileContext from '../../../contexts/PreviewProfileContext';
import { getProfileOfUser } from '../../../api/profileAPI';
import { UserData } from '../../../model/UserData';
import Profile from '../../Profile/Profile';

interface FriendInfoProps {
  friend: FriendData,
  intraName: string,
}

function FriendInfo(props: FriendInfoProps) {

  const [onlineStatus, setOnlineStatus] = useState("offline");
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);
  const { friend, intraName } = props;
  let friendInfo: UserData = useMemo(() => (friend.receiver.intraName === intraName ? friend.sender : friend.receiver), []);
  let friendshipStatus = friend.status.toLowerCase();

  friendshipStatus = (friendshipStatus !== "pending"
    ? friendshipStatus
    : (friend.receiver.intraName === intraName ? "incoming" : "outgoing")
  )

  useEffect(() => {
    if (friendshipStatus === "blocked")
      return;
    let friendInfoSocket = new SocketApi();
    friendInfoSocket.sendMessages("statusRoom", { intraName: friendInfo.intraName, joining: true });
    friendInfoSocket.listen("statusRoom", (data: any) => {
      if (data !== undefined && data.status !== undefined && data.intraName === friendInfo.intraName)
        setOnlineStatus((data.status as string).toLowerCase());
    });

    return () => {
      friendInfoSocket.removeListener("statusRoom");
      friendInfoSocket.sendMessages("statusRoom", { intraName: friendInfo.intraName, joining: false });
    }
  }, [friend]);

  return (
    <div className={`flex flex-row w-fit text-highlight ${friendshipStatus !== "blocked" ? 'hover:cursor-pointer group hover:bg-highlight hover:text-dimshadow' : ''}`} onClick={viewFriendProfile}>
      <div className='group-hover:underline w-[16ch] normal-case'>
        {friendInfo.userName}
      </div>
      <FriendlistSeparator />
      <div className='w-[16ch] group-hover:underline'>
        {friendInfo.intraName}
      </div>
      <FriendlistSeparator />
      <div className='w-[9ch]'>
        {
          friendshipStatus === "blocked"
            ? <span className='whitespace-pre text-highlight bg-accRed'> HIDDEN </span>
            : friendInfo.elo
        }
      </div>
      <FriendlistSeparator />
      <div className={`w-[12ch]`}>
        <FriendlistTag type={friendshipStatus} />
      </div>
      {
        <>
          <div className={`${friend.status.toLowerCase() === "blocked" ? 'invisible' : ''}`}>
            <FriendlistSeparator />
          </div>
          <div className={`w-[9ch] ${friend.status.toLowerCase() === "blocked" ? 'invisible' : ''}`}>
            {onlineStatus.toLowerCase()}
          </div>
        </>
      }
    </div>
  )

  async function viewFriendProfile() {

    if (friendshipStatus === "blocked") return;

    let friendData = await getProfileOfUser(friendInfo.intraName);
    setPreviewProfileFunction(friendData.data as UserData);
    setTopWidgetFunction(<Profile expanded={true} />)
  }
}

export default FriendInfo
