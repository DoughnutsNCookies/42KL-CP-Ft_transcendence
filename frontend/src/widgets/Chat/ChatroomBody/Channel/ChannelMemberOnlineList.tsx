import { useContext, useEffect, useMemo, useState } from "react";
import { NewChannelContext } from "../../../../contexts/ChatContext";
import { UserData } from "../../../../model/UserData";
import { FriendsContext } from "../../../../contexts/FriendContext";
import PreviewProfileContext from "../../../../contexts/PreviewProfileContext";
import Profile from "../../../Profile/Profile";
import StatusIndicator from "../../../Profile/StatusIndicator";
import SocketApi from "../../../../api/socketApi";
import { ChannelMemberRole } from "./newChannelReducer";

interface ChannelMemberOnlineProfileProps {
  member: ChannelMemberRole;
}

function ChannelMemberOnlineProfile(props: ChannelMemberOnlineProfileProps) {

  const { member } = props;
  const { friends } = useContext(FriendsContext);
  const [onlineStatus, setOnlineStatus] = useState("offline");
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);
  const { intraName, userName, intraId, avatar } = member.memberInfo;
  const isBlocked = useMemo(checkIfFriendIsBlocked, [friends]);

  useEffect(() => {
    if (isBlocked || member.isBanned) return;
    let friendInfoSocket = new SocketApi();
    friendInfoSocket.sendMessages("statusRoom", { intraName: intraName, joining: true });
    friendInfoSocket.listen("statusRoom", (data: any) => {
      if (data !== undefined && data.status !== undefined && data.intraName === intraName)
        setOnlineStatus((data.status as string).toLowerCase());
    });

    return () => {
      friendInfoSocket.removeListener("statusRoom");
      friendInfoSocket.sendMessages("statusRoom", { intraName: intraName, joining: false });
    }
  }, []);

  return (
    <div className="flex flex-row items-center justify-between w-full h-fit">
      <div className={`flex flex-row items-center gap-x-3 group ${!isBlocked && 'hover:cursor-pointer'}`} onClick={viewProfile}>
        <img src={avatar} alt="" className="w-8 aspect-square" />
        <p className={`text-sm font-normal text-highlight ${!isBlocked && 'group-hover:underline'}`}>{userName}</p>
      </div>
      <div className="aspect-square w-fit">
        {(!isBlocked && !member.isBanned) && <StatusIndicator status={onlineStatus} showText={false} small invert/>}
      </div>
    </div>
  )

  function checkIfFriendIsBlocked() {
    const friendRelationship = friends.find((friend) => friend.sender.intraId === intraId || friend.receiver.intraId === intraId);
    if (friendRelationship === undefined) return false;
    if (friendRelationship.status.toLowerCase() === "blocked") return true;
    return false;
  }

  function viewProfile() {
    if (isBlocked) return;
    setPreviewProfileFunction(member.memberInfo);
    setTopWidgetFunction(<Profile expanded={true} />)
  }
}

function ChannelMemberOnlineList() {

  const { state } = useContext(NewChannelContext);
  const members = useMemo(() => {
    return state.members.sort((a, b) => {
      if (a.memberInfo.userName < b.memberInfo.userName) return -1;
      if (a.memberInfo.userName > b.memberInfo.userName) return 1;
      return 0;
    });
  }, [state.members]);

  return (
    <div className='absolute z-30 flex flex-col items-end w-full h-full transition-all duration-150 bg-dimshadow/60'>
      <div className='w-[60%] h-[75%] text-highlight bg-dimshadow my-auto border-4 border-highlight border-r-0 flex flex-col p-5 gap-y-2'>
        <p className='text-sm font-extrabold'>MEMBERS {`(${state.members.length})`}</p>
        <div className="box-border flex flex-col w-full h-full overflow-y-scroll gap-y-2 scrollbar-hide">
          {members.map((member) => {
            return (<div id={`${member.memberInfo.intraId}`}><ChannelMemberOnlineProfile member={member} /></div>);
          })}
        </div>
      </div>
    </div>
  )
}

export default ChannelMemberOnlineList;