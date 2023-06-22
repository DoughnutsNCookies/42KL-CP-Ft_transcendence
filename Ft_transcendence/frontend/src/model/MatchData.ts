import { UserData } from "./UserData";

export interface MatchData {
  player1: UserData;
  player2: UserData;
  player1Score: number;
  player2Score: number;
  winner: string;
  gameType: string;
  wonBy: string;
  matchId: number;
  matchDate: Date;
}
