import { FaSadCry } from 'react-icons/fa'
import { UserData } from '../../../model/UserData'
import { useContext, useEffect, useState } from 'react';
import UserContext from '../../../contexts/UserContext';

interface EmptyFriendlistProps {
  userData: UserData
}

function EmptyFriendlist(props: EmptyFriendlistProps) {

  const { userData } = props;
  const { myProfile } = useContext(UserContext);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  if (userData.intraId === myProfile.intraId) {
    return (
      <div className={`flex flex-col items-center m-auto text-2xl text-center w-fit h-fit text-highlight gap-y-4 ${animate ? "" : " translate-y-2 opacity-0"} transition-all duration-700`}>
        <p className='flex flex-row gap-x-3'>You have no friends... Boohoo <FaSadCry className='animate-bounce text-accYellow' /></p>
        <p className='text-lg'>Use <span className='bg-highlight text-dimshadow'>friend add [username]</span> to add some friends!</p>
      </div>
    )
  } else {
    return (
      <div className={`flex flex-col items-center m-auto text-2xl text-center w-fit h-fit text-highlight gap-y-4 ${animate ? "" : " translate-y-6 opacity-0"} transition-all duration-700`}>
        <p className='flex flex-row gap-x-3'>{userData.userName} has no friends... Boohoo <FaSadCry className='animate-bounce text-accYellow' /></p>
        <p className='text-lg'>Use <span className='bg-highlight text-dimshadow'>friend add {userData.intraName}</span> to send a friend request!</p>
      </div>
    )
  }
}

export default EmptyFriendlist