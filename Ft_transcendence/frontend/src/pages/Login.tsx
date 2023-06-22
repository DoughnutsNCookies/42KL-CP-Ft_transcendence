import Title from '../components/Title';
import login from '../api/loginAPI';
import PromptField, { CommandOptionData } from '../components/PromptField';
import { useEffect, useRef, useState } from 'react';

function LoginBadge() {
  const [slideIn, setSlideIn] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setSlideIn(true);
    }, 500);
    setTimeout(() => {
      setFadeIn(true);
    }, 1200);
  }, []);

  return (
    <div className='mt-[25px] p-3 font-bungee leading-none rounded-3xl h-[150px] w-[160px] border-4 border-highlight flex flex-col items-center'
      style={{ borderWidth: '10px' }}>
       <div className='flex self-end mt-1 flex-row'>
        <div className={`text-3xl ${slideIn ? "" : "opacity-0"} transition-opacity duration-700`}>42</div>
        <div className={`ml-[0.375rem] mt-[0.375rem] h-[1.5rem] ${slideIn ? "w-[60px]" : "w-0"} transition-all duration-700 bg-highlight rounded-sm`} />
      </div>
      <div className='flex self-start flex-row'>
        <div className={`mr-[0.375rem] mt-[0.375rem] h-[1.5rem] ${slideIn ? "w-[60px]" : "w-0"} transition-all duration-700 bg-highlight rounded-sm`} />
        <div className={`text-3xl ${slideIn ? "" : "opacity-0"} transition-opacity duration-700`}>ft</div>
      </div>
      <div className={`text-xs mt-1 ${fadeIn ? "" : " translate-y-3 opacity-0"} transition-all duration-700`}>transcendence</div>
    </div>
  )
}

function SkewedPattern() {
  const [expended, setExpended] = useState(false);
  const [skewed, setSkewed] = useState(false);

  useEffect(() => {
    setExpended(true);
    setTimeout(() => {
      setSkewed(true);
    }, 300);
  }, []);
  return (
    <div className='flex flex-row'>
      <div className='w-[500px]' />
      <div className={`${expended ? "h-16" : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-3"} transition-all duration-300 bg-accRed w-9 mx-1 `} />
      <div className={`${expended ? "h-16" : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-3"} transition-all duration-300 bg-accCyan w-9 mx-1 `} />
      <div className={`${expended ? "h-16" : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-3"} transition-all duration-300 bg-accYellow w-9 mx-1 `} />
      <div className={`${expended ? "h-16" : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-3"} transition-all duration-300 bg-accBlue w-9 mx-1 `} />
    </div>
  )
}

function Login() {

  const [errorCount, setErrorCount] = useState(0);
  const [errorStyle, setErrorStyle] = useState("");

  const promptFieldRef = useRef<any>(null);

  useEffect(() => {
    promptFieldRef.current?.focusOnInput();
  }, []);

  useEffect(() => {
    if (errorCount === 0)
      return;
    setTimeout(() => {
      setErrorStyle("animate-h-shake");
    }, 5);
    setErrorStyle("");
  }, [errorCount]);

  return (
    <div className='w-[80%] h-full mx-auto flex flex-col justify-center items-center text-highlight'>
      <SkewedPattern />
      <div className='relative flex flex-row mb-8'>
        <div className='w-[95%] mr-4'>
          <Title />
        </div>
        <LoginBadge />
      </div>
      <div className={`${errorStyle} duration-[0.1s]`}>
        <PromptField
          handleCommands={handleCommands}
          availableCommands={[new CommandOptionData({ command: "LOGIN" }), new CommandOptionData({ command: "BACKDOOR" })]}
          center={true}
          capitalize={true}
          ref={promptFieldRef}
        />
      </div>
      {
        (errorCount >= 3 && <div className='mt-3 uppercase opacity-0 animate-pulse text-md'>Have you tried using 'LOGIN' or 'BACKDOOR'?</div>)
      }
    </div >
  )

  function handleCommands(command: string[]) {
    switch (command[0]) {
      case "LOGIN":
        sessionStorage.setItem("google", "false");
        login();
        break;
      case "BACKDOOR":
        sessionStorage.setItem("google", "true");
        login();
        break;
      default:
        setErrorCount(errorCount + 1);
    }
  }
}

export default Login