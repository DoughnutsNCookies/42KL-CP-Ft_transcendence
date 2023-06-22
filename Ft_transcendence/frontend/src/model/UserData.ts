export interface UserData {
  intraId: number;
  userName: string;
  intraName: string;
  email: string;
  elo: number;
  accessToken: string;
  avatar: string;
  tfaSecret: string | null;
  winning: boolean;
}
