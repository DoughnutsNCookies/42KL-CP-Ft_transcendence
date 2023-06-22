import React, { useState } from 'react'
import Leaderboard from './Leaderboard';
import { LeaderboardUser } from '../../model/leadeboardUser';
import api from '../../api/api';
import { getHallOfFame, getHallOfShame } from '../../api/leaderboardAPIs';

interface LeaderboardTabsProps {
  replaceLeaderBoardUsers?: (leaderboardUsers: LeaderboardUser[], type: "hallOfFame" | "hallOfShame") => void;
}

/**
 * @state isActive: to identify which tab is currently active
 */
function LeaderboardTabs(props: LeaderboardTabsProps) {
  const { replaceLeaderBoardUsers } = props;
  const [selectedTab, setSelectedTab] = useState<"hallOfFame" | "hallOfShame">("hallOfFame");

  return (
    <div className='flex flex-row justify-end uppercase font-bold text-sm text-highlight '>
      <button type='button' onClick={showHallOfFame} className={`p-2 active:bg-highlight active:text-dimshadow hover:bg-highlight hover:text-dimshadow transition-all ${selectedTab === "hallOfFame" ? "bg-highlight text-dimshadow animate-pulse" : ""}`}>HALL OF FAME</button>
      <button type='button' onClick={showHallOfShame} className={`p-2 active:bg-highlight active:text-dimshadow hover:bg-highlight hover:text-dimshadow transition-all ${selectedTab === "hallOfShame" ? "bg-highlight text-dimshadow animate-pulse" : ""}`}>HALL OF SHAME</button>
    </div>
  )

  async function showHallOfFame() {
    const newLeaderboardUsers = await getHallOfFame(0, 30);
    if (replaceLeaderBoardUsers) {
      replaceLeaderBoardUsers(newLeaderboardUsers, "hallOfFame");
    }
    setSelectedTab("hallOfFame");
  }

  async function showHallOfShame() {
    const newLeaderboardUsers = await getHallOfShame(0, 30);
    if (replaceLeaderBoardUsers) {
      replaceLeaderBoardUsers(newLeaderboardUsers, "hallOfShame");
    }
    setSelectedTab("hallOfShame");
  }
}

export default LeaderboardTabs