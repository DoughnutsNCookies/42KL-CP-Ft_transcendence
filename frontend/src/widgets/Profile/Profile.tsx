import React, { useContext, useEffect, useState } from 'react'
import sleep from '../../functions/sleep';
import ProfileHeader from './Expanded/ProfileHeader';
import ProfileBody from './Expanded/ProfileBody';
import RecentMatches from './RecentMatches/RecentMatches';
import SocketApi from '../../api/socketApi';
import PreviewProfileContext from '../../contexts/PreviewProfileContext';
import UserContext from '../../contexts/UserContext';

interface ProfileProps {
  expanded?: boolean;
}

function Profile(props: ProfileProps) {
  const { currentPreviewProfile, setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);
  const { myProfile } = useContext(UserContext);
  const [pixelSize, setPixelSize] = useState(400);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("online");
  const [animating, setAnimating] = useState(false);
  const { defaultSocket } = useContext(UserContext);

  useEffect(() => {
    if (props.expanded) setExpanded(true);
    else setExpanded(false);
  }, [props.expanded]);

  useEffect(() => {
    pixelatedToSmooth();
    if (!currentPreviewProfile.intraName) return;
    defaultSocket.sendMessages("statusRoom", { intraName: currentPreviewProfile.intraName, joining: true });
    defaultSocket.listen("statusRoom", (data: any) => {
      if (data !== undefined && data.status !== undefined && data.intraName === currentPreviewProfile.intraName)
        setStatus((data.status as string).toLowerCase());
    });

    return () => {
      defaultSocket.removeListener("statusRoom");
      defaultSocket.sendMessages("statusRoom", { intraName: currentPreviewProfile.intraName, joining: false });
    }
  }, [currentPreviewProfile.intraName]);

  return (<div className='flex flex-col items-center w-full select-none bg-highlight box-border'>
    <ProfileHeader expanded={expanded} status={status} onProfileClick={onProfileClick} />
    <ProfileBody expanded={expanded} pixelSize={pixelSize} status={status} onProfileClick={onProfileClick} />
    <RecentMatches expanded={expanded} />
  </div>);

  async function pixelatedToSmooth(start: number = 200) {
    let tmp = start;
    while (tmp > 1) {
      tmp = Math.floor(tmp / 1.05);
      if (tmp < 1) tmp = 1;
      setPixelSize(tmp);
      await sleep(10);
    }
  }

  async function onProfileClick() {
    if (animating) return;
    handleAnimate();
    setExpanded(!expanded);
    if (expanded) {
      setTopWidgetFunction(<Profile />);
      setPreviewProfileFunction(myProfile);
    }
    if (pixelSize > 1) return;
    pixelatedToSmooth();
  }

  async function handleAnimate() {
    setAnimating(true);
    await sleep(500);
    setAnimating(false);
  }
}

export default Profile