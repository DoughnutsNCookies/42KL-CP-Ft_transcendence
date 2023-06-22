import { createContext } from 'react';
import SocketApi from '../api/socketApi';
import { UserData } from '../model/UserData';

let myProfile: UserData = {
	accessToken: "hidden",
	avatar: "",
	elo: 400,
	intraId: 130305,
	intraName: "wricky-t",
	tfaSecret: null,
	userName: "JOHNDOE",
	winning: true,
	email: ""
}

interface UserContextProps {
	defaultSocket: SocketApi,
	myProfile: UserData;
	setMyProfile: (profile: UserData) => void;
}

const UserContext = createContext<UserContextProps>({
	defaultSocket: new SocketApi(),
	myProfile: myProfile,
	setMyProfile: (profile) => { myProfile = profile }
});

export default UserContext;