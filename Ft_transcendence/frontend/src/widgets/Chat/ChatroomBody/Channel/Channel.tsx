import React, { useContext, useMemo, useState } from 'react'
import { FaEye, FaLock, FaTimes, FaUsers } from 'react-icons/fa';
import { ImEarth } from 'react-icons/im';
import { ChatroomData, InviteMemberData } from '../../../../model/ChatRoomData';
import PreviewProfileContext from '../../../../contexts/PreviewProfileContext';
import { FriendsContext } from '../../../../contexts/FriendContext';
import UserContext from '../../../../contexts/UserContext';
import { UserData } from '../../../../model/UserData';
import Profile from '../../../Profile/Profile';
import { inviteMemberToChannel } from '../../../../api/chatAPIs';
import { ErrorData } from '../../../../model/ErrorData';
import { ChatContext } from '../../../../contexts/ChatContext';
import ChatroomList from '../Chatroom/ChatroomList';
import MegaMind from '../../../../../assets/images/megamind.png';

interface ChannelProps {
  channelInfo: ChatroomData;
  setHasErrorJoining: React.Dispatch<React.SetStateAction<boolean>>;
  setJoinChannelErrorMsg: React.Dispatch<React.SetStateAction<string>>;
}

function Channel(props: ChannelProps) {

  const { channelInfo, setHasErrorJoining, setJoinChannelErrorMsg } = props;
  const { channelName, owner, memberCount, password } = channelInfo;
  const { myProfile } = useContext(UserContext);
  const { friends } = useContext(FriendsContext);
  const { setChatBody } = useContext(ChatContext);
  const [joinPassword, setJoinPassword] = useState<string>('');
  const [askForPassword, setAskForPassword] = useState<boolean>(false);
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);
  // const [hasErrorJoining, setHasErrorJoining] = useState<boolean>(false);
  // const [joinChannelErrorMsg, setJoinChannelErrorMsg] = useState<string>('');

  return (
    <>
      {askForPassword && askForPasswordForm()}
      <div className='w-full h-fit py-2.5 border-b-2 border-highlight/50 text-highlight'>
        <div className='flex flex-col gap-y-2'>
          <div className='flex flex-row items-center justify-between gap-x-2'>
            <div className='flex flex-row'>
              <p className='w-[16ch] truncate text-base font-extrabold'>{channelName}</p>
              <p className='flex flex-row items-center ml-5 text-xs tracking-wide uppercase text-highlight/50 gap-x-1'>{ password === null ? <><ImEarth /> public</> : <><FaLock className='text-xs' /> protected</> }</p>
            </div>
            <div className='flex flex-row items-center text-sm gap-x-2'>
              <FaUsers />
              {memberCount}
            </div>
          </div>
          <div className='flex flex-row justify-between w-full'>
            <div className='flex flex-row text-sm'>
              <p className='whitespace-pre'>owner: </p>
              <button className='cursor-pointer bg-accCyan hover:underline' onClick={viewOwnerProfile}>{owner?.userName}</button>
            </div>
            <button className='border border-highlight text-highlight bg-dimshadow px-[1ch] text-sm hover:bg-accGreen transition-all duration-100' onClick={joinChannel}>JOIN</button>
          </div>
        </div>
      </div>
    </>
  )

  function askForPasswordForm() {

    return (
      <div className='absolute z-20 flex flex-col items-center justify-center w-full h-full transition-all duration-100 -translate-x-1/2 bg-dimshadow/70 gap-y-2 -translate-y-1/3 top-1/3 left-1/2'>
        <div className='w-[70%] h-fit bg-dimshadow border-2 border-highlight rounded p-3 flex flex-col gap-y-3'>
          <button className='p-1 border-2 rounded border-dimshadow w-fit aspect-square hover:bg-highlight hover:text-dimshadow bg-dimshadow text-highlight' onClick={closeForm}><FaTimes /></button>
          <div className='relative flex flex-col items-center w-full'>
            <img src={MegaMind} className='w-[60%] select-none' alt="no password?" />
            <p className='absolute w-full font-extrabold text-center uppercase top-1'>No password?</p>
          </div>
          {/* {hasErrorJoining && <p className='text-xs text-center bg-accRed px-[1ch] mx-auto w-fit'>{joinChannelErrorMsg}</p>} */}
          <div className='flex flex-col items-center w-[60%] mx-auto gap-y-2'>
            <div className='flex flex-row w-full'>
              <input id="channel-password" type="password" placeholder='Password' className='flex-1 p-1 text-center border-2 border-r-0 rounded-l outline-none border-highlight placeholder:text-center placeholder:text-highlight/50 bg-dimshadow' value={joinPassword} onChange={handlePasswordOnChange} />
              <button className='flex flex-row items-center justify-center h-full transition-colors duration-150 border-2 rounded-r border-highlight bg-highlight text-dimshadow hover:text-highlight hover:bg-dimshadow aspect-square' onMouseDown={showPassword} onMouseUp={showPassword}><FaEye /></button>
            </div>
            <button className={`w-full p-1 font-extrabold uppercase transition-colors duration-150 border-2 rounded dur border-highlight ${joinPassword.length < 1 ? 'opacity-20 cursor-default' : 'hover:bg-accGreen'}`} disabled={joinPassword.length < 1} onClick={joinChannelWithPassword}>Join</button>
          </div>
        </div>
      </div>
    )

    function closeForm() {
      setAskForPassword(false);
    }

    function handlePasswordOnChange(e: React.ChangeEvent<HTMLInputElement>) {
      setJoinPassword(e.target.value);
    }

    function showPassword(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
      e.preventDefault();
      e.stopPropagation();
      const passwordInput = document.getElementById('channel-password') as HTMLInputElement;
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
      } else {
        passwordInput.type = 'password';
      }
    }
  }

  function viewOwnerProfile() {
    const ownerRelationship = friends.find((friend) => friend.sender.intraId === owner?.intraId || friend.receiver.intraId === owner?.intraId);
    if (ownerRelationship?.status.toLowerCase() === "blocked") return;
    setPreviewProfileFunction(owner as UserData);
    setTopWidgetFunction(<Profile />);
  }

  async function sendJoinRequest(password: string | null) {
    
    const joinRequest: InviteMemberData = {
      channelId: channelInfo.channelId,
      intraName: myProfile.intraName,
      isAdmin: false,
      isBanned: false,
      isMuted: false,
      password: password
    }

    try {
      const joinRequestResponse = await inviteMemberToChannel(joinRequest);
      if (joinRequestResponse.status === 201) {
        setChatBody(<ChatroomList />);
      }
    } catch (err: any) {
      const errorMessage = err.response.data as ErrorData;
      if (errorMessage) {
        if (askForPassword) setAskForPassword(false);
        setHasErrorJoining(true);
        if (errorMessage.error === "Invalid password - password does not match") {
          setJoinPassword('');
          setJoinChannelErrorMsg("Wrong password!");
        } else if (errorMessage.error === "Invalid channelId - channel is not found") {
          setJoinChannelErrorMsg("Channel not found :(");
        }
      }
    }
  }

  async function joinChannelWithPassword() {
    if (joinPassword.length < 1) return;
    sendJoinRequest(joinPassword);
  }

  async function joinChannel() {
    if (password !== null) {
      setAskForPassword(true);
      return;
    }
    sendJoinRequest(null);
  }
}

export default Channel