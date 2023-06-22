import React, { useContext, useEffect, useState } from 'react'
import sleep from '../../../functions/sleep';
import MatchCard from './MatchCard';
import { UserData } from '../../../model/UserData';
import { MatchData } from '../../../model/MatchData';
import { getRecentMatchesOfUser } from '../../../api/profileAPI';
import PreviewProfileContext from '../../../contexts/PreviewProfileContext';

interface RecentMatchesProps {
  expanded: boolean;
}

const matches = [
  {
    id: 1,
    ply1: 'joe',
    ply2: 'mama',
    ply1score: 2,
    ply2score: 3,
  },
  {
    id: 2,
    ply1: 'joeeeeeeeeeeeeee',
    ply2: 'mamamamamamamama',
    ply1score: 100,
    ply2score: 300,
  },
  {
    id: 3,
    ply1: 'joe',
    ply2: 'mama',
    ply1score: 2,
    ply2score: 3,
  },
]

function RecentMatches(props: RecentMatchesProps) {
  const { expanded } = props;
  const [matches, setMatches] = useState<MatchData[]>([]);
  const { currentPreviewProfile } = useContext(PreviewProfileContext);
  const maxHeight = 300;
  const [height, setHeight] = useState(0);
  const matchCards = matches.map((match, index) => <MatchCard key={match.matchId} data={match} />)

  useEffect(() => {
    getRecentMatchesOfUser(currentPreviewProfile.intraName).then((data) => {
      setMatches(data.data);
    });
  }, [currentPreviewProfile.intraName]);

  useEffect(() => {
    if (height == 0 && expanded)
      animateHeight();
    if (height == maxHeight && !expanded)
      setHeight(0);
  }, [expanded]);

  return (
    <div className='flex flex-col overflow-y-scroll scrollbar-hide border-box bg-dimshadow mb-1 w-full transition-all duration-500 ease-in-out gap-2'
      style={{ height: height }}
      onScroll={handlescroll}
    >
      <div className='w-[80%] mx-auto'>
        <p className='mx-auto mt-8 mb-2 text-sm font-normal uppercase text-highlight'>recent matches</p>
        <div className='flex flex-col mx-auto gap-y-4'>
          {matchCards}
        </div>
      </div>
    </div>
  )

  async function animateHeight() {
    await sleep(500);
    setHeight(maxHeight);
  }

  function handlescroll(e: any) {
    if (matches.length % 5 > 0) return;
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (!bottom) return;
    getRecentMatchesOfUser(currentPreviewProfile.intraName, Math.floor(matches.length / 5)).then((data) => {
      setMatches([...matches, ...data.data]);
    });
  }
}

export default RecentMatches