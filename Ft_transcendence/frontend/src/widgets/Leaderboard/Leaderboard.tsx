import React, { useEffect } from 'react'
import LeaderboardPattern from './LeaderboardPattern'
import LeaderboardTitle from './LeaderboardTitle'
import LeaderboardTabs from './LeaderboardTabs'
import LeaderboardTable from './LeaderboardTable'
import { LeaderboardUser } from '../../model/leadeboardUser'
import { set, update } from 'lodash';
import { getHallOfFame } from '../../api/leaderboardAPIs'

function Leaderboard() {
  const [leaderboardUsers, setLeaderboardUsers] = React.useState<LeaderboardUser[]>([]);
  const [type, setType] = React.useState<"hallOfFame" | "hallOfShame">("hallOfFame");

  useEffect(() => {
    getHallOfFame(0, 30).then((newLeaderboardUsers) => {
      setLeaderboardUsers(newLeaderboardUsers);
    });
  }, []);

  return (
    <div className='flex flex-col flex-1 w-full pb-0 overflow-hidden px-9 gap-y-4 box-border'>
      <LeaderboardTitle />
      <LeaderboardTabs replaceLeaderBoardUsers={replaceleaderboardUser} />
      <LeaderboardTable leaderboardUsers={leaderboardUsers} appendLeaderBoardUsers={appendLeaderboardUser} type={type} />
    </div>
  )

  function replaceleaderboardUser(newLeaderboardUsers: LeaderboardUser[], type: "hallOfFame" | "hallOfShame") {
    setLeaderboardUsers(newLeaderboardUsers);
    setType(type);
  }

  function appendLeaderboardUser(newLeaderboardUsers: LeaderboardUser[]) {
    setLeaderboardUsers([...leaderboardUsers, ...newLeaderboardUsers]); 
  }
}

export default Leaderboard