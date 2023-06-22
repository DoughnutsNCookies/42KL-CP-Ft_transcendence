import api from "./api";
import { ErrorData } from "../model/ErrorData";
import { UserData } from "../model/UserData";
import { MatchData } from "../model/MatchData";
import { UserStats } from "../model/UserStats";

export function getMyProfile() {
  return api.get<UserData | ErrorData>("/user");
}

export function getProfileOfUser(intraName: string) {
  return api.get<UserData | ErrorData>(`/user/${intraName}`);
}

export function getProfileStat(intraName: string) {
  return api.get<UserStats>(`/match/stats/${intraName}`);
}

export function getRecentMatchesOfUser(
  intraName: string,
  page: number = 0,
  perPage: number = 5
) {
  return api.get<MatchData[]>(
    `/match/${intraName}?page=${page}&perPage=${perPage}`
  );
}
