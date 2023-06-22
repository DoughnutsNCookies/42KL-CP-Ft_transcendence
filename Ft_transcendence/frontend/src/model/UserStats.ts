import { UserData } from "./UserData";

export interface UserStats {
  winStreak: number;
  highestElo: number;
  win: number;
  lose: number;
  worst_nightmare: UserData;
  punching_bag: UserData;
}
