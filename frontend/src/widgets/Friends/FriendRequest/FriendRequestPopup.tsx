import React, { useContext } from 'react'
import { FaHandshake } from 'react-icons/fa'
import { CollapsiblePopup } from '../../../components/Popup'
import FriendAction from '../FriendAction/FriendAction';
import { ACTION_TYPE } from '../FriendAction/FriendActionCard';
import UserContext from '../../../contexts/UserContext';

interface FriendRequestProps {
  total: number
  setLeftWidget: React.Dispatch<React.SetStateAction<JSX.Element | null>>
}

function FriendRequestContent(props: FriendRequestProps) {

  const { setLeftWidget } = props;
  const { myProfile } = useContext(UserContext);
  let totalRequest = (props.total > 99 ? 99 : props.total);

  return (
    <div className='flex flex-col items-center w-full text-center select-none h-fit gap-y-1'>
      <p className='text-lg font-bold cursor-pointer text-accCyan hover:underline' onClick={viewFriendRequests}>({totalRequest}) New Friend Request</p>
      <p className='text-sm text-highlight/50'>Check your friend requests using</p>
      <p className='text-sm text-highlight/50'><span onClick={viewFriendRequests} className=' cursor-pointer px-[1ch] bg-accGreen text-highlight'>friend requests</span> command!</p>
    </div>
  )

  function viewFriendRequests() {
    setLeftWidget(<FriendAction user={myProfile} action={ACTION_TYPE.ACCEPT} onQuit={() => setLeftWidget(null)} />);
  }
}

function FriendRequestIcon() {
  return (
    <div className='h-full w-full text-3xl relative hover:text-4xl transition-all duration-[0.2s] ease-in-out select-none'>
      <FaHandshake className='absolute -translate-x-1/2 -translate-y-1/2 text-highlight top-1/2 left-1/2' />
    </div>
  )
}

function FriendRequestPopup(props: FriendRequestProps) {
  return (
    <CollapsiblePopup
      icon={<FriendRequestIcon />}
      content={<FriendRequestContent total={props.total} setLeftWidget={props.setLeftWidget} />}
    />
  )
}

export default FriendRequestPopup