import { getTFA, removeTFA, checkTFA, forgotTFA } from '../api/tfaAPI';
import { ITFAData } from '../model/TfaData';
import React, { useContext, useEffect } from 'react'
import Card, { CardType } from './Card';
import UserContext from '../contexts/UserContext';
import { getMyProfile } from '../api/profileAPI';
import { UserData } from '../model/UserData';
import { ErrorData } from '../model/ErrorData';

interface TFAProps {
	commands: string[];
}

enum TFACommands {
	help,
	set,
	unset,
	exist,
	success,
	fail,
	forgot,
	sending,
	notset,
	refresh
}

function help() {
	return (
		<Card type={CardType.SUCCESS}>
			<span className='text-xl neonText-white font-bold'>TFA</span><br/>
			<p className="text-highlight text-md font-bold capitalize pt-4">Commands:</p>
			<p className="text-sm">
				tfa set					: <span className="text-highlight/70">Sets and enables Google 2FA.</span><br />
				tfa unset [OTP code]	: <span className="text-highlight/70">Unsets and disable 2FA (requires OTP code).</span><br />
				tfa check [OTP code]	: <span className="text-highlight/70">Checks whether code is valid or not.</span><br />
				tfa forgot				: <span className="text-highlight/70">Emails new 2FA secret (may require relogin).</span><br />
			</p>
		</Card>
	)
}

async function updateMyProfile(setProfile: (profile: UserData) => void) {
	const profile = ((await getMyProfile()).data as UserData);
	setProfile(profile);
}

function Tfa(props: TFAProps) {

	const { commands } = props;
	const { setMyProfile } = useContext(UserContext);
	const [tfa, setTfa] = React.useState<ITFAData>({} as ITFAData);
	const [result, setResult] = React.useState<TFACommands>(TFACommands.exist);

	if (commands.length === 2 && commands[1] === "set") {
		useEffect(() => {
			getTFA().then((data) => {
				setTfa(data);
				setResult(data.qr === null && data.secret === null ? TFACommands.exist : TFACommands.set)
				updateMyProfile(setMyProfile);
			})
		}, [])
	} else if (commands.length === 3 && commands[1] === "unset" && commands[2].length === 6 && commands[2].match(/^[0-9]+$/) !== null) {
		useEffect(() => {
			setResult(TFACommands.fail)
			removeTFA(commands[2]).then(() => {
				setResult(TFACommands.unset);
				updateMyProfile(setMyProfile);
			})
		}, [])
	} else if (commands.length === 3 && commands[1] === "check" && commands[2].length === 6 && commands[2].match(/^[0-9]+$/) !== null) {
		useEffect(() => {
			checkTFA(commands[2]).then((data) => {
				setResult(data.success ? TFACommands.success : TFACommands.fail)
			})
		}, [])
	} else if (commands.length === 2 && commands[1] === "forgot") {
		useEffect(() => {
			setResult(TFACommands.sending)
			forgotTFA().then((data) => {
				setResult(data.error !== undefined ? TFACommands.notset : TFACommands.forgot)
			}).catch((error: any) => {
				const errorObj = error.response.data as ErrorData;
				if (errorObj && errorObj.error === "Not authorized") {
					document.cookie = "Authorization=;";
					setResult(TFACommands.refresh);
				}
			})
		}, [])
	} else {
		return help();
	}

	if (result === TFACommands.set) {
		return (
			<Card type={CardType.SUCCESS}>
				<figure>
					<p className='text-center'>Scan QR code with your Google Authenticator app</p>
					<img src={tfa.qr} className='object-cover mx-auto rounded-md'></img>
					<p className='text-center'> SECRET: {tfa.secret}</p>
				</figure>
			</Card>
		);
	} else if (result === TFACommands.unset) {
		return (<Card type={CardType.SUCCESS}><p>TFA unset and disabled</p></Card>);
	} else if (result === TFACommands.exist) {
		return (<Card type={CardType.ERROR}><p>TFA already set</p></Card>);
	} else if (result === TFACommands.success) {
		return (<Card type={CardType.SUCCESS}><p>TFA OTP is correct</p></Card>);
	} else if (result === TFACommands.fail) {
		return (<Card type={CardType.ERROR}><p>TFA OTP is incorrect</p></Card>);
	} else if (result === TFACommands.forgot) {
		return (<Card type={CardType.SUCCESS}><p>Successfully sent New TFA secret to your email</p></Card>);
	} else if (result === TFACommands.sending) {
		return (<Card type={CardType.SUCCESS}><p>Sending new TFA secret to your email...</p></Card>);
	} else if (result === TFACommands.notset) {
		return (<Card type={CardType.ERROR}><p>TFA is not enabled</p></Card>);
	} else if (result === TFACommands.refresh) {
		return (<Card type={CardType.ERROR}><p>Please refresh your page and try again...</p></Card>);
	}
	return help();
}

export default Tfa