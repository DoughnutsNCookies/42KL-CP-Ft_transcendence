import { LeaderboardUser } from "../model/leadeboardUser";
import api from "./api";

async function getHallOfFame(page: number, perPage: number) {
  const respond = await api.get<any[]>(`/leaderboard/hallOfFame?page=${page}&perPage=${perPage}`);
  const newLeaderboardUsers: LeaderboardUser[] = respond.data.map((user) => {
    const item: LeaderboardUser = {
      userName: user.userName,
      elo: user.elo,
      intraName: user.intraName,
    };
    return item;
  });
  return newLeaderboardUsers;
}

async function getHallOfShame(page: number, perPage: number) {
  const respond = await api.get<any[]>(`/leaderboard/hallOfShame?page=${page}&perPage=${perPage}`);
  const newLeaderboardUsers: LeaderboardUser[] = respond.data.map((user) => {
    const item: LeaderboardUser = {
      userName: user.userName,
      elo: user.elo,
      intraName: user.intraName,
    };
    return item;
  });
  return newLeaderboardUsers;
}

export { getHallOfFame, getHallOfShame };
