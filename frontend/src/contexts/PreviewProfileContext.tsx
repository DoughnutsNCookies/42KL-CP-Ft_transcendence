import { UserData } from '../model/UserData';
import { createContext } from 'react'

let myProfile: UserData = {
	accessToken: "hidden",
	avatar: "",
	elo: 400,
	intraId: 130305,
	intraName: "wricky-t",
	tfaSecret: null,
	userName: "JOHNDOE",
	winning: false,
	email: "hidden",
}

interface ProfileContextProps {
	currentPreviewProfile: UserData;
	setPreviewProfileFunction: (func: UserData) => void;
	setTopWidgetFunction: (func: any) => void;
}

export const PreviewProfileContext = createContext<ProfileContextProps>({
	currentPreviewProfile: myProfile,
	setPreviewProfileFunction: (func) => { },
	setTopWidgetFunction: (func) => { },
});

export default PreviewProfileContext;