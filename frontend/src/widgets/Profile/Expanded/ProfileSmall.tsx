import React, { useContext, useEffect, useState } from 'react'
import sleep from '../../../functions/sleep';
import StatusIndicator from '../StatusIndicator';
import { UserData } from '../../../model/UserData';
import UserContext from '../../../contexts/UserContext';
import PreviewProfileContext from '../../../contexts/PreviewProfileContext';

interface ProfileSmallProps {
  expanded: boolean;
  status: string;
}

const titles: { [key: string]: string } = {
  '0': 'DISAPPOINTMENT',
  '100': 'UH OH',
  '200': 'PADDLE MADE IN CHINA',
  '300': 'IT WAS THE LAG',
  '400': 'BEGINNER PADDLE',
  '500': 'BALL SCRATCHER',
  '600': 'PADDLE WIZARD',
  '700': 'SIR BOUNCE-A-LOT',
  '800': 'PING PONG CONNOISSEUR',
  '900': 'THE SPINNER',
  '1000': 'SUPREME PADDLE WARRIOR',
  '1100': 'GRANDMASTER OF THE TABLE',
  '1200': 'LEGENDARY BALLER',
  '1300': 'PADDLE HACKER',
  '1400': 'PING CHILLING',
  '1500': 'BASH GURU',
  '1600': 'SULTAN OF SWAT',
  '1700': 'NO PING SPIKE',
  '1800': 'AGROSTOPHOBIA',
  '1900': 'PONG GOD',
  '2000': 'PONG KHONVOUM',
};

function ProfileSmall(props: ProfileSmallProps) {
  const { expanded, status } = props;
  const { currentPreviewProfile: myProfile } = useContext(PreviewProfileContext);
  const { userName, elo } = myProfile;
  const [width, setWidth] = useState("w-0");

  useEffect(() => {
    if (expanded)
      setWidth("w-full h-20");
    else
      setWidth("w-0");
  }, [expanded]);

  const getEloTitle = () => {
    let currentTitle = 'HOW IS THIS POSSIBLE';

    for (const range in titles) {
      if (elo >= parseInt(range)) {
        currentTitle = titles[range];
      } else {
        break;
      }
    }

    return currentTitle;
  };


  return (
    <div className={`flex flex-row overflow-hidden items-center transition-all duration-500 ease-in-out ${width}`} >
      <div className='flex flex-col justify-center mx-5'>
        <div className='text-2xl font-extrabold  text-dimshadow'>{userName}</div>
        <div className='text-xs  text-dimshadow'>{getEloTitle()}</div>
      </div>
      <div className='w-1 h-16 mr-5  bg-dimshadow' />
      <div>
        <StatusIndicator status={status} />
      </div>
    </div>
  )

  async function animateWidth() {
    await sleep(10);
    setWidth("w-full h-20");
  }
}

export default ProfileSmall