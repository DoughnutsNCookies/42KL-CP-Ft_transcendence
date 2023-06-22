import React, { useContext, useEffect, useState } from 'react'
import PreviewProfileContext from '../../../contexts/PreviewProfileContext';
import { UserStats } from '../../../model/UserStats';
import { getProfileStat } from '../../../api/profileAPI';
import Triangle from '../../../components/Triangle';

interface ProfileStatProps {
  expanded: boolean;
}

interface SmallStatProfileProps {
  userData: any;
}

const SmallStatProfile = (props: SmallStatProfileProps) => {
  const { userData } = props;
  if (!userData)
    return (<div></div>)
  return (
    <div className="absolute bg-highlight p-2 w-52 h-28 top-[90px] rounded shadow-md transition-all">
      <div className="flex justify-between">
        <div>
          <img src={userData.avatar} alt="User Avatar" className="w-20 h-20 ml-1 pb-0 pl-0 rounded" />
        </div>
        <div className="flex items-center justify-center m-auto pl-4">
          <span className="absolute text-dimshadow text-center font-extrabold" style={{
            textShadow: '-0.06em 0 0 #fef8e2, 0 0.06em 0 #fef8e2, 0.06em 0 0  #fef8e2, 0 -0.06em 0 #fef8e2',
            fontSize: '40px'
            }}>
            {userData.elo}
          </span>
          <Triangle w={70} h={70} color="fill-dimshadow" direction={userData.winning ? 'top' : 'bottom'}></Triangle>
        </div>
      </div>
      <div className="pt-1 ml-1">
        <span className="text-dimshadow">{userData.userName}    ({userData.intraName})</span>
      </div>
    </div>
  );
}

function ProfileStat(props: ProfileStatProps) {
  const { expanded } = props;
  const { currentPreviewProfile } = useContext(PreviewProfileContext);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showWorstNightmare, setShowWorstNightmare] = useState<boolean>(false);
  const [showPunchingBag, setShowPunchingBag] = useState<boolean>(false);

  useEffect(() => {
    getProfileStat(currentPreviewProfile.intraName).then((data) => {
      setStats(data.data);
    });
  }, [currentPreviewProfile.intraName]);

  return (
    <div className='flex flex-col overflow-hidden aspect-square transition-all duration-1000 ease-in-out box-border'
      style={expanded ? { flex: '1 1 0%' } : { width: "0px" }}>
      <div className='bg-dimshadow h-full flex flex-col justify-center items-center text-highlight font-bold text-xs xl:text-sm overflow-hidden'>
        <div>Highest Elo: {stats?.highestElo}</div>
        <div>Longest Win-Streak: {stats?.winStreak}</div>
        <div>Total Wins: {stats?.win}</div>
        <div>Total Losses: {stats?.lose}</div>
        <br />
        {showWorstNightmare && <SmallStatProfile userData={stats?.worst_nightmare}></SmallStatProfile>}
        <div
          className='hover:bg-accRed hover:text-highlight truncate text-accRed'
          onMouseOver={() => setShowWorstNightmare(true)}
          onMouseLeave={() => setShowWorstNightmare(false)}
        >
          WORST NIGHTMARE
        </div>
        {showPunchingBag && <SmallStatProfile userData={stats?.punching_bag}/>}
        <div
          className='hover:bg-accCyan hover:text-highlight text-accCyan'
          onMouseOver={() => setShowPunchingBag(true)}
          onMouseLeave={() => setShowPunchingBag(false)}
        >
          PUNCHING BAG
        </div>
      </div>
      <div className='flex-1 p-1 text-xs font-extrabold text-center xl:p-2 xl:text-base'>
        STATS
      </div>
    </div>
  )
}

export default ProfileStat