import React, { useContext, useEffect, useRef, useState } from 'react'
import { FaCheck, FaDoorOpen, FaEye, FaTimes, FaToolbox, FaTrash, FaUserSecret } from 'react-icons/fa';
import { TbScript } from 'react-icons/tb';
import { ImEarth } from 'react-icons/im'
import { NewChannelAction, NewChannelError, NewChannelState } from './newChannelReducer';
import { NewChannelContext } from '../../../../contexts/ChatContext';
import { ChatroomData } from '../../../../model/ChatRoomData';
import UserContext from '../../../../contexts/UserContext';

interface ChannelInfoProps {
  currentChannelData?: ChatroomData,
  isReviewingChanges?: boolean,
  setIsReviewingChanges?: (newState: boolean) => void;
  modifying: boolean,
  setModifyChannel: () => void;
}

function ChannelInfoForm(props: ChannelInfoProps) {

  const { state, dispatch } = useContext(NewChannelContext);
  const { modifying, setModifyChannel, isReviewingChanges = false, setIsReviewingChanges = () => {} } = props;
  const [channelName, setChannelName] = useState<string>(state.channelName);
  const [password, setPassword] = useState<string | null>(null); // old password for editing, new password for creating
  const [newPassword, setNewPassword] = useState<string | null>(null); // new password for editing, should only use when editing
  const [isPrivate, setIsPrivate] = useState<boolean>(state.isPrivate);
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(state.password !== null);
  const [changePassword, setChangePassword] = useState<boolean>(false);
  const [showChannelNameNamingRules, setShowChannelNameNamingRules] = useState<boolean>(false);
  const [showPasswordRules, setShowPasswordRules] = useState<boolean>(false);
  const [previousChannelInfo, setPreviousChannelInfo] = useState<NewChannelState>(state);

  return (
    <div className='w-[70%] h-fit flex flex-row items-center mx-auto'>
      <div className='flex flex-row items-center justify-between w-full'>
        <div className='w-[30%] flex flex-col h-full items-center gap-y-2'>
          <button
            className={`flex flex-col items-center gap-y-1 w-full aspect-square rounded outline-none ${modifying || (modifying && (!state.isNewChannel && state.isOwner)) ? 'hover:border-dashed hover:border-2 hover:border-highlight cursor-pointer' : 'cursor-default'} focus:border-dashed focus:border-2 focus:border-highlight py-3 relative group cursor-default`}
            onClick={toggleChannelVisibility}
          >
            <div className={`hidden ${modifying && (!state.isNewChannel && state.isOwner) ? 'group-hover:flex' : ''} transition-all duration-200 ease-in-out absolute p-2 top-0 w-full h-full bg-highlight/80 overflow-hidden rounded text-xl font-extrabold text-dimshadow`}>
              <p className='w-full my-auto uppercase h-fit'>Switch to {isPrivate ? 'public' : 'private'}</p>
            </div>
            <div className='flex flex-col items-center w-full my-auto h-fit gap-y-2'>
              {isPrivate ? <FaUserSecret className='text-highlight text-7xl' /> : <ImEarth className='text-highlight text-7xl' />}
              <p className='text-base font-extrabold underline uppercase text-highlight'>{isPrivate ? 'private' : 'public'}</p>
            </div>
          </button>
          { !state.isNewChannel && (modifying) && <button className='flex flex-row items-center p-2 text-xs font-bold text-center uppercase whitespace-pre border-2 rounded bg-highlight hover:bg-dimshadow text-dimshadow hover:text-highlight border-highlight w-fit h-fit' onClick={() => setIsReviewingChanges(!isReviewingChanges)}><TbScript className='text-base' /> Review Changes</button> }
        </div>
        <div className={`flex flex-col justify-center h-full ${modifying ? 'gap-y-2' : 'gap-y-4'} w-[60%]`}>
          <div className='flex flex-col h-full gap-y-1'>
            <p className={`${modifying ? 'text-highlight' : 'text-highlight/50'} text-sm font-extrabold`}>Channel Name</p>
            {
              modifying && (state.isOwner || state.isNewChannel)
                ? <input type="text" className='w-full px-4 py-2 text-sm font-extrabold text-center border-2 rounded outline-none border-highlight bg-dimshadow text-highlight cursor-text' autoComplete='off' value={channelName} onChange={handleChannelNameOnChange} onFocus={() => setShowChannelNameNamingRules(true)} onBlur={() => setShowChannelNameNamingRules(false)} />
                : <p className='font-extrabold text-highlight'>{channelName}</p>
            }
            {
              (state.errors.includes(NewChannelError.INVALID_CHANNEL_NAME) || showChannelNameNamingRules) &&
              <div className='text-xs px-[1ch] text-highlight/50'>
                <p className='flex flex-row items-center whitespace-pre gap-x-2'><span className={`text-xs ${channelName.length > 0 && channelName.length <= 16 && 'text-accGreen'}`}>{channelName.length > 0 && channelName.length <= 16 ? <FaCheck /> : <FaTimes />}</span> {'>'} 1 & {'<='} 16 characters</p>
              </div>
            }
          </div>
          {
            ((!state.isNewChannel && modifying && previousChannelInfo.password !== null && !previousChannelInfo.isPrivate) || (!isPrivate && isPasswordProtected && modifying)) &&
            <div className='flex flex-col h-full gap-y-1'>
              <div className='flex flex-row items-center justify-between'>
                <p className='text-sm font-extrabold text-highlight'>Password</p>
                {!state.isNewChannel && !isPasswordProtected && previousChannelInfo.password !== null && <p className='w-fit animate-pulse text-[10px] px-[1ch] text-highlight bg-accRed'>DISABLED AFTER SAVE</p>}
              </div>
             {(!state.isNewChannel && modifying && previousChannelInfo.password !== null && !previousChannelInfo.isPrivate) && <p className='text-[10px] text-highlight/50'>Require password to change channel info</p>}
             {(state.errors.includes(NewChannelError.WRONG_PASSWORD)) && <p className='text-[10px] text-highlight bg-accRed px-[1ch] w-fit'>Wrong password!</p>}
              <div className='flex flex-row items-center h-[40px]'>
                <input type="password" id='channel-password' autoComplete='off' autoCorrect='disabled' className='w-full h-full px-4 py-2 text-base font-extrabold text-center border-2 border-r-0 rounded rounded-r-none outline-none border-highlight bg-dimshadow text-highlight cursor-text placeholder:text-highlight/40 placeholder:text-sm' placeholder={changePassword ? `Old Password` : `Password`} value={password ? password : ''} onChange={handlePasswordOnChange} onFocus={() => setShowPasswordRules(true)} onBlur={() => setShowPasswordRules(false)} />
                <button className='h-full p-2 font-bold transition-all duration-150 ease-in-out border-2 rounded rounded-l-none bg-highlight border-highlight hover:bg-dimshadow hover:text-highlight' onMouseDown={toggleShowPassword} onMouseUp={toggleShowPassword}><FaEye className='mx-auto' /></button>
              </div>
              {
                (state.isNewChannel || (state.errors.includes(NewChannelError.INVALID_PASSWORD) || showPasswordRules)) &&
                <div className='text-xs px-[1ch] text-highlight/50'>
                  <p className='flex flex-row items-center whitespace-pre gap-x-2'><span className={`text-xs ${password && password.length > 0 && password.length <= 16 && 'text-accGreen'}`}>{password && password.length > 0 && password.length <= 16 ? <FaCheck /> : <FaTimes />}</span> {'>'} 1 & {'<='} 16 characters</p>
                </div>
              }
            </div>
          }
          {
            changePassword && !state.isNewChannel && !isPrivate && modifying &&
            <div className='flex flex-col h-full gap-y-2'>
              <div className='flex flex-row items-center h-[40px]'>
                <input type="password" id='channel-new-password' autoComplete='off' autoCorrect='disabled' className='w-full h-full px-4 py-2 text-base font-extrabold text-center border-2 border-r-0 rounded rounded-r-none outline-none border-highlight bg-dimshadow text-highlight cursor-text placeholder:text-highlight/40 placeholder:text-sm' placeholder='New Password' value={newPassword ? newPassword : ''} onChange={handleNewPasswordOnChange} onFocus={() => setShowPasswordRules(true)} onBlur={() => setShowPasswordRules(false)} />
                <button className='h-full p-2 font-bold transition-all duration-150 ease-in-out border-2 rounded rounded-l-none bg-highlight border-highlight hover:bg-dimshadow hover:text-highlight' onMouseDown={toggleShowNewPassword} onMouseUp={toggleShowNewPassword}><FaEye className='mx-auto' /></button>
              </div>
              {
                (state.errors.includes(NewChannelError.INVALID_NEW_PASSWORD) || (!state.isNewChannel && showPasswordRules)) &&
                <div className='text-xs px-[1ch] text-highlight/50'>
                  <p className='flex flex-row items-center whitespace-pre gap-x-2'><span className={`text-xs ${newPassword && newPassword.length > 0 && newPassword.length <= 16 && 'text-accGreen'}`}>{newPassword && newPassword.length > 0 && newPassword.length <= 16 ? <FaCheck /> : <FaTimes />}</span> {'>'} 1 & {'<='} 16 characters</p>
                </div>
              }
            </div>
          }
          {
            !state.isNewChannel && !modifying &&
            <div className={`flex flex-row w-full gap-2`}>
              {(state.isOwner || state.isAdmin) && <button className='flex flex-row items-center justify-center w-full p-2 text-xs font-bold transition-all duration-150 ease-in-out border-2 rounded h-fit bg-highlight border-highlight hover:bg-dimshadow hover:text-highlight gap-x-2' onClick={toggleEditChannel}><FaToolbox /> MANAGE CHANNEL</button>}
              {!state.isOwner && <button className='flex flex-row items-center justify-center w-full p-2 text-xs font-bold transition-all duration-150 ease-in-out border-2 rounded h-fit gap-x-2 text-accRed bg-dimshadow border-accRed hover:bg-accRed hover:text-highlight' onClick={tryLeaveChannel}><FaDoorOpen /> LEAVE CHANNEL</button>}
              {state.isOwner && <button className='flex flex-row items-center justify-center w-full p-2 text-xs font-bold transition-all duration-150 ease-in-out border-2 rounded h-fit gap-x-2 text-highlight bg-accRed border-accRed hover:bg-dimshadow hover:text-accRed' onClick={tryDeleteChannel}><FaTrash /> DELETE CHANNEL</button>}
            </div>
          }
          <div className='flex flex-row items-center gap-x-2'>
            {modifying && !isPrivate && !isPasswordProtected && ((state.isOwner && !state.isNewChannel) || state.isNewChannel) && <button className='w-full p-2 text-xs font-bold transition-all duration-150 ease-in-out border-2 rounded h-fit bg-accGreen text-highlight border-accGreen hover:bg-dimshadow hover:text-accGreen' onClick={togglePassword}>ENABLE PASSWORD</button>}
            {modifying && !isPrivate && isPasswordProtected && (state.isOwner && !state.isNewChannel) && <button className='w-full p-2 text-xs font-bold transition-all duration-150 ease-in-out border-2 rounded h-fit bg-highlight border-highlight hover:bg-dimshadow hover:text-highlight' onClick={togglePassword}>DISABLE PASSWORD</button>}
            {isPrivate || (!previousChannelInfo.isPrivate && previousChannelInfo.password !== null && modifying && (state.isOwner)) && <button className='w-full p-2 text-xs font-bold transition-all duration-150 ease-in-out border-2 rounded h-fit text-highlight bg-accCyan border-accCyan hover:bg-dimshadow hover:text-accCyan' onClick={changeChannelPassword}>{changePassword ? `CANCEL CHANGE` : `CHANGE PASSWORD`}</button>}
          </div>
          {!state.isNewChannel && modifying && <button className='p-2 text-sm font-bold transition-all duration-150 ease-in-out border-2 rounded bg-dimshadow text-accRed border-accRed hover:bg-accRed hover:text-highlight' onClick={toggleEditChannel}>CANCEL</button>}
        </div>
      </div>
    </div>
  )

  function tryLeaveChannel() {
    if (state.isTryingToLeaveChannel) return;
    dispatch({ type: 'IS_TRYING_TO_LEAVE_CHANNEL' });
  }

  function tryDeleteChannel() {
    if (state.isTryingToDeleteChannel) return;
    dispatch({ type: 'IS_TRYING_TO_DELETE_CHANNEL' });
  }

  function toggleEditChannel() {
    
    setModifyChannel();
    if (!modifying) {
      const clone = JSON.parse(JSON.stringify(state));
      setPreviousChannelInfo(clone);
    } else {
      dispatch({ type: 'CLONE_STATE', state: previousChannelInfo });
      if (changePassword && !state.isNewChannel && !isPrivate && isPasswordProtected)
        setChangePassword(!changePassword);
      setChannelName(previousChannelInfo.channelName);
      setIsPrivate(previousChannelInfo.isPrivate);
      setIsPasswordProtected(previousChannelInfo.password !== null);
      if (previousChannelInfo.password !== null) {
        dispatch({ type: 'SET_CHANNEL_PASSWORD', password: ''});
        setPassword('');
      } else {
        dispatch({ type: 'SET_CHANNEL_PASSWORD', password: null});
        setPassword(null);
      }
      setNewPassword(null);
    }
  }

  function toggleChannelVisibility() {

    if (!state.isNewChannel && state.isAdmin) return;

    if (!modifying) return;

    if (isPrivate) {
      // switch to public
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: null });
      dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: null });
    } else {
      // switch to private
      if (previousChannelInfo.password !== null) {
        dispatch({ type: 'SET_CHANNEL_PASSWORD', password: ''});
        setPassword('');
      } else {
        dispatch({ type: 'SET_CHANNEL_PASSWORD', password: null });
        setPassword(null);
      }
      dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: null });
      setNewPassword(null);
      setIsPasswordProtected(false);
    }
    setIsPrivate(!isPrivate);
    dispatch({ type: 'SET_CHANNEL_PRIVACY', isPrivate: !isPrivate });
  }

  function changeChannelPassword() {
    if (!isPasswordProtected) setIsPasswordProtected(true);
    if (changePassword) {
      setNewPassword(null);
      dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: null });
    } else {
      setNewPassword('');
      dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: '' });
    }
    setChangePassword(!changePassword);
  }

  function togglePassword() {
    // current password protection state
    if (isPasswordProtected) {
      // switch to unprotected
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: null });
      dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: null });
      setNewPassword(null);
      if (changePassword) {
        setChangePassword(!changePassword);
      }
    }
    
    if (!isPasswordProtected) {
      // switch to protected
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: '' });
      setPassword('');
      dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: '' });
      setNewPassword('');
    }
    setIsPasswordProtected(!isPasswordProtected);
  }

  function toggleShowPassword(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    const passwordInput = document.getElementById('channel-password') as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }

  function toggleShowNewPassword(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    const passwordInput = document.getElementById('channel-new-password') as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }

  function handleChannelNameOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setChannelName(e.target.value);
    dispatch({ type: 'SET_CHANNEL_NAME', channelName: e.target.value });
  }

  function handlePasswordOnChange(e: React.ChangeEvent<HTMLInputElement>) {

    if (state.isNewChannel && isPasswordProtected) {
      setPassword(e.target.value);
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: e.target.value });
      return ;
    }

    // when editing channel info and previously this channel was password protected
    if (!state.isNewChannel && previousChannelInfo.password !== null) {
      setPassword(e.target.value);
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: e.target.value });
      // if the user wants to change the password and will be set to password protected
      if (isPasswordProtected && !changePassword) {
        setNewPassword(e.target.value);
        dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: e.target.value });
      }
      return ;
    }

    if (!isPrivate && !state.isNewChannel && isPasswordProtected) {
      setPassword(e.target.value);
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: e.target.value });
      if (!changePassword) {
        dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: e.target.value });
      }
      return ;
    }

    if (isPrivate && previousChannelInfo.password !== null) {
      // setPassword(e.target.value);
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: e.target.value });
      return ;
    }

    if (isPrivate && isPasswordProtected) {
      dispatch({ type: 'SET_CHANNEL_PASSWORD', password: e.target.value });
    }
  }

  function handleNewPasswordOnChange(e: React.ChangeEvent<HTMLInputElement>) {

    if (!isPasswordProtected && !state.isNewChannel) {
      dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: null});
    }

    setNewPassword(e.target.value);
    dispatch({ type: 'SET_CHANNEL_NEW_PASSWORD', newPassword: e.target.value });
  }
}

export default ChannelInfoForm