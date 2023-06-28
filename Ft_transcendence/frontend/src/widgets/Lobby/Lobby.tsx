import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import PixelatedImage from '../../components/PixelatedImage'
import ProfileElo from '../Profile/Expanded/ProfileElo'
import { UserData } from '../../model/UserData'
import ProfileSmall from '../Profile/Expanded/ProfileSmall'
import duck from '../../../assets/duck.png'
import speedGIF from '../../../assets/GIFS/SpeedPaddle.gif'
import speedPNG from '../../../assets/GIFS/SpeedPaddle.png'
import spinGIF from '../../../assets/GIFS/SpinPaddle.gif'
import spinPNG from '../../../assets/GIFS/SpinPaddle.png'
import longGIF from '../../../assets/GIFS/LongPaddle.gif'
import longPNG from '../../../assets/GIFS/LongPaddle.png'
import magnetPNG from '../../../assets/GIFS/MagnetPaddle.png'
import magnetGIF from '../../../assets/GIFS/MagnetPaddle.gif'
import boringGIF from '../../../assets/GIFS/BoringGame.gif'
import standardGIF from '../../../assets/GIFS/StandardGame.gif'
import deathGIF from '../../../assets/GIFS/DeathGame.gif'
import { GameType, PaddleType } from '../../game/gameData'
import { gameData } from '../../main'
import { getProfileOfUser } from '../../api/profileAPI'
import { ErrorData } from '../../model/ErrorData';
import UserContext from '../../contexts/UserContext'
import sleep from '../../functions/sleep'
import Triangle from '../../components/Triangle'
import { FaAngry, FaBeer, FaHeart, FaHotjar, FaPoop, FaQuestion, FaSadCry, FaSkull, FaThumbsDown, FaThumbsUp } from 'react-icons/fa'
import terminator from '../../../assets/terminator.webp'
import rick from '../../../assets/rick.png'
import musk from '../../../assets/musk.jpeg'

const emoteList = [
  <FaThumbsUp size={100} />,
  <FaThumbsDown size={100} />,
  <FaSkull size={100} />,
  <FaQuestion size={100} />,
  <FaSadCry size={100} />,
  <FaAngry size={100} />,
  <FaPoop size={100} />,
  <FaHeart size={100} />,
  <FaHotjar size={100} />,
  <FaBeer size={100} />,
]

const emoteListSmall = [
  <FaThumbsUp size={25} />,
  <FaThumbsDown size={25} />,
  <FaSkull size={25} />,
  <FaQuestion size={25} />,
  <FaSadCry size={25} />,
  <FaAngry size={25} />,
  <FaPoop size={25} />,
  <FaHeart size={25} />,
  <FaHotjar size={25} />,
  <FaBeer size={25} />,
]

function Lobby() {
  const [selectedMode, setSelectedMode] = React.useState<GameType>(gameData.gameType);
  const [ready, setReady] = React.useState(false);
  const [selectedPowerUp, setSelectedPowerUp] = React.useState<PaddleType>(PaddleType.Vzzzzzzt);
  const [onCountdown, setOnCountdown] = React.useState(false);
  const [currentEmote, setCurrentEmote] = React.useState<number>(0);
  const [emotes, setEmotes] = React.useState<JSX.Element[]>([]);
  const myProfile = useContext(UserContext).myProfile;

  useEffect(() => {
    gameData.lobbyCountdown = () => setOnCountdown(true);
    gameData.setGameType = (type: GameType) => setSelectedMode(type);
  }, []);

  useEffect(() => {
    gameData.socketApi.listen("emote", (data: number) => {
      setEmotes((emotes) => [...emotes, <Emote key={Math.random().toString() + Date.now().toString()} emote={data} />]);
      setTimeout(() => {
        setEmotes((emotes) => emotes.slice(1));
      }, 3000);
    });
  }, []);

  const opponent = useMemo(() => {
    if (gameData.player1IntraId === myProfile.intraName) {
      return gameData.player2IntraId;
    } else {
      return gameData.player1IntraId;
    }
  }, []);

  const { powerButtonActive, boringButtonActive, standardButtonActive, deathButtonActive } = useMemo(() => {
    let powerButtonActive = false;
    let boringButtonActive = false;
    let standardButtonActive = false;
    let deathButtonActive = false;

    if (gameData.gameType === '') {
      boringButtonActive = true;
      standardButtonActive = true;
      deathButtonActive = true;
    }
    if (selectedMode === 'standard') {
      powerButtonActive = true;
    }
    if (gameData.isPrivate) {
      boringButtonActive = true;
      standardButtonActive = true;
      deathButtonActive = true;
    }
    if (gameData.gameType === 'practice') {
      powerButtonActive = true;
    }
    if (ready) {
      powerButtonActive = false;
      boringButtonActive = false;
      standardButtonActive = false;
      deathButtonActive = false;
    }
    return { powerButtonActive, boringButtonActive, standardButtonActive, deathButtonActive };
  }, [ready, gameData.gameType, selectedMode]);

  return (
    <div className=' flex flex-col font-bungee tracking-widest text-highlight items-center p-10 box-border h-full'>
      <div className=' flex flex-row w-full box-border h-full'>
        <div className=' h-full flex-1 flex flex-col items-center box-border m-10 mt-0'>
          <h1 className='text-[40px] font-extrabold'>OPPONENT</h1>
          <div className="mb-12 border-4 rounded border-highlight">
            <LobbyProfile playerIntraId={opponent} />
          </div>
          {powerButtonActive || selectedMode === "standard" ?
            (
              <div className=' shrink grid grid-cols-2 grid-rows-2 w-full gap-x-20 gap-y-20 max-w-md max-h-md place-items-center box-border'>
                <PowerUpButton active={powerButtonActive} onClick={() => setSelectedPowerUp(PaddleType.Vzzzzzzt)} selected={selectedPowerUp === PaddleType.Vzzzzzzt} gif={speedGIF} img={speedPNG} title='Vzzzzzzt' content='Faster ball.' />
                <PowerUpButton active={powerButtonActive} onClick={() => setSelectedPowerUp(PaddleType.Piiuuuuu)} selected={selectedPowerUp === PaddleType.Piiuuuuu} gif={magnetGIF} img={magnetPNG} title='Piiuuuuu' content={'Hold left click to hold the ball on contact,\nrelease left click to release.'} />
                <PowerUpButton active={powerButtonActive} onClick={() => setSelectedPowerUp(PaddleType.Ngeeeaat)} selected={selectedPowerUp === PaddleType.Ngeeeaat} gif={longGIF} img={longPNG} title='Ngeeeaat' content='Longer paddle.' />
                <PowerUpButton active={powerButtonActive} onClick={() => setSelectedPowerUp(PaddleType.Vrooooom)} selected={selectedPowerUp === PaddleType.Vrooooom} gif={spinGIF} img={spinPNG} title='Vrooooom' content='Stronger spin.' />
              </div>
            ) :
            <div className=' mx-auto my-auto items-center flex flex-row  text-2xl'><p className=' whitespace-pre'>No PowerUp For You! </p ><FaSadCry width={60} height={60} /></div >
          }
          <h2 className=' mt-auto text-[25px] text-highlight font-extrabold'>gamemode: <span className={selectedMode === "boring" ? "text-highlight" : selectedMode === "standard" ? "text-accCyan" : "text-accRed"}>{selectedMode === "death" ? "sudden death" : selectedMode}</span> </h2>
          <div className=' flex flex-row gap-x-2 w-full h-fit'>
            <LobbyButton active={boringButtonActive} title='boring' selected={selectedMode === "boring"} onClick={() => gameData.socketApi.sendMessages("changeGameType", { gameType: "boring" })} />
            <LobbyButton active={standardButtonActive} title='standard' color='accCyan' selected={selectedMode === "standard"} onClick={() => gameData.socketApi.sendMessages("changeGameType", { gameType: "standard" })} />
            <LobbyButton active={deathButtonActive} title='death' color='accRed' selected={selectedMode === "death"} onClick={() => gameData.socketApi.sendMessages("changeGameType", { gameType: "death" })} />
          </div>
        </div>
        <div className=' top-0 w-64 flex flex-col items-center gap-3 box-border'>
          <div className='flex-1'>
          </div>
          <div className="flex flex-row items-center gap-6 box-border pb-10">
            <Arrow direction='left' onMouseDown={() => setCurrentEmote(currentEmote === 0 ? 9 : currentEmote - 1)} />
            <SendEmote emotes={emotes} currentEmote={currentEmote} />
            <Arrow direction='right' onMouseDown={() => setCurrentEmote(currentEmote === 9 ? 0 : currentEmote + 1)} />
          </div>
          <LobbyReadyButton >
            <p className={`uppercase font-extrabold w-full text-md text-highlight group-hover:text-dimshadow text-center`}
              onClick={() => gameData.leaveLobby()}
            >leave</p>
          </LobbyReadyButton>
          <LobbyReadyButton onClick={() => sendReady()} selected={ready} active={selectedMode !== ""}>
            {onCountdown ? <CountDown /> :
              <p className={`uppercase font-extrabold text-3xl m-5 ${ready ? "text-dimshadow" : "text-highlight"} group-hover:text-dimshadow text-center`}>ready</p>}
          </LobbyReadyButton>
        </div>
      </div>
      {emotes}
    </div>
  )

  function sendReady() {
    const newReady = !ready;
    setReady(newReady);
    if (selectedPowerUp === PaddleType.Ngeeeaat)
      gameData.sendReady(newReady, "Ngeeeaat");
    else if (selectedPowerUp === PaddleType.Piiuuuuu)
      gameData.sendReady(newReady, "Piiuuuuu");
    else if (selectedPowerUp === PaddleType.Vrooooom)
      gameData.sendReady(newReady, "Vrooooom");
    else if (selectedPowerUp === PaddleType.Vzzzzzzt)
      gameData.sendReady(newReady, "Vzzzzzzt");
    else if (selectedPowerUp === PaddleType.boring)
      gameData.sendReady(newReady, "normal");
  }

  interface EmoteProps {
    emote: number;
  }

  function Emote(props: EmoteProps) {
    return (
      <div className={`absolute bottom-0 animate-emoteFloat transition-all -translate-x-full -translate-y-1/2 opacity-0`}
        style={{ left: `${Math.random() * 100 - 13}%` }}
      >
        {emoteListSmall[props.emote]}
      </div>
    )
  }
}

export default Lobby;

interface SendEmoteProps {
  emotes: JSX.Element[];
  currentEmote: number;
}

function SendEmote(props: SendEmoteProps) {
  const { currentEmote } = props;
  const intervalRef = useRef<number | null>(null);
  const lastPressRef = useRef<number>(0);

  function handleMouseDown() {
    const now = Date.now();
    if (now - lastPressRef.current < 16) return;
    lastPressRef.current = now;
    handleLongPress();
  };

  function handleMouseUp() {
    if (intervalRef.current !== null)
      clearInterval(intervalRef.current);
  };

  function handleLongPress() {
    intervalRef.current = setInterval(() => {
      sendEmote();
    }, 100);
  };

  const sendEmote = () => {
    gameData.socketApi.sendMessages("emote", {
      emote: currentEmote
    });
  }

  return (
    <button className=" hover:scale-110 transition-all transform relative uppercase font-extrabold w-1/2 text-md text-highlight group-hover:text-dimshadow text-center cursor-pointer"
      onClick={sendEmote}
      onMouseDown={() => handleMouseDown()}
      onMouseUp={() => handleMouseUp()}
      onMouseLeave={() => handleMouseUp()}
    >
      {emoteList[currentEmote]}
    </button>
  )
}

interface ArrowProps {
  direction: "top" | "right" | "bottom" | "left";
  onMouseDown: () => void;
}

function Arrow(props: ArrowProps) {
  const { direction, onMouseDown } = props;
  const [hovering, setHovering] = useState<boolean>(false);

  return (
    <button onMouseDown={onMouseDown} className="w-[40px] h-[40px] relative cursor-pointer"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={`absolute ${hovering ? "scale-125" : "scale-100"} left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all transform`}>
        <Triangle direction={direction} w={40} h={40} ></Triangle>
      </div>
    </button>
  )
}

function CountDown() {
  const [count, setCount] = React.useState(3);
  useEffect(() => {
    if (count <= 0) return;
    const timeout = setTimeout(() => {
      setCount(count - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [count]);
  return (
    <div className=' relative'>
      <p className={` uppercase font-extrabold text-3xl m-5 text-dimshadow text-center ${count > 0 ? "animate-ping" : ""}`}>{count}</p>
      <p className=' absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 uppercase font-extrabold text-3xl text-dimshadow text-center'>{count}</p>
    </div>
  )
}

interface PowerUpButtonProps {
  title?: string;
  content?: string;
  gif?: string;
  img?: string;
  selected?: boolean;
  onClick?: () => void;
  active?: boolean;
}


function PowerUpButton(props: PowerUpButtonProps) {
  const { title, content, onClick, gif, img, selected, active = true } = props;
  const [hover, setHover] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const hoverRef = React.useRef<HTMLDivElement>(null);

  return (
    <button className='w-full relative cursor-pointer'
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={() => setHover(active ? true : false)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={(e) => handleMouseMove(e)}
      disabled={!active}
    >
      {imgLoaded ? null : <div className=' animate-pulse bg-highlight/50 border-4 rounded-lg aspect-square' />}
      <img src={hover ? gif : img} className={` border-4 w-full ${selected ? "border-highlight animate-pulse" : "border-highlight/10"} rounded-lg transition-colors ${active && "hover:border-highlight"} ${imgLoaded ? " opacity-100" : " opacity-0"}`}
        onLoad={() => imgOnLoad()}
      />
      <div ref={hoverRef} className={`z-10 pointer-events-none font-jbmono rounded-lg border-highlight border-2 text-start bg-dimshadow absolute w-[400px] p-2 transition-opacity ease-in duration-200 ${hover ? " opacity-100" : " opacity-0"} `}>
        <h3 className=' text-lg'>{title}</h3>
        <p className=' text-sm font-normal'>{content}</p>
      </div>
    </button>
  )

  function imgOnLoad() {
    setImgLoaded(true);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (buttonRef.current == null || hoverRef.current == null) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hoverRef.current.style.left = `${x + 10}px`;
    hoverRef.current.style.top = `${y + 10}px`;
  }
}

function LobbyProfile(props: { playerIntraId: string }) {
  const { playerIntraId } = props;
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [pixelSize, setPixelSize] = React.useState(200);

  useEffect(() => {
    if (playerIntraId === "BOT") return;
    getProfileOfUser(playerIntraId).then((data) => {
      setUserData(data.data as UserData);
      pixelatedToSmooth();
    });
  }, [playerIntraId]);

  useEffect(() => {
    if (playerIntraId !== "BOT") return;
    var i = Math.floor(Math.random() * 3);
    if (i === 0) {
      setUserData({
        intraId: 0,
        userName: "SKYNET",
        intraName: "SKYNET",
        email: "skynet@pongsh.com",
        elo: 99999,
        accessToken: "",
        avatar: terminator,
        tfaSecret: "",
        winning: true,
      });
    }
    else if (i === 1) {
      setUserData({
        intraId: 0,
        userName: "伊隆马",
        intraName: "MUSK",
        email: " musk@pongsh.com",
        elo: 226,
        accessToken: "",
        avatar: musk,
        tfaSecret: "",
        winning: true,
      });
    } else {
      setUserData({
        intraId: 0,
        userName: "Roll",
        intraName: "ROLL",
        email: "roll@pongsh.com",
        elo: 1400000000,
        accessToken: "",
        avatar: rick,
        tfaSecret: "",
        winning: true,
      });

    }
    pixelatedToSmooth();
  }, [playerIntraId]);

  const titles: { [key: string]: string } = {
    '0': 'DISAPPOINTMENT',
    '100': 'UH OH',
    '200': 'PADDLE MADE IN CHINA',
    '300': 'IT WAS THE LAG',
    '400': 'BEGINNER PADDLE',
    '500': 'BALL SCRATCHER',
    '600': 'PADDLE WIZARD',
    '700': 'SIR BOUNCE-A-LOT',
    '800': 'PING PONG CONNOISSEUR',
    '900': 'THE SPINNER',
    '1000': 'SUPREME PADDLE WARRIOR',
    '1100': 'GRANDMASTER OF THE TABLE',
    '1200': 'LEGENDARY BALLER',
    '1300': 'PADDLE HACKER',
    '1400': 'PING CHILLING',
    '1500': 'BASH GURU',
    '1600': 'SULTAN OF SWAT',
    '1700': 'NO PING SPIKE',
    '1800': 'AGROSTOPHOBIA',
    '1900': 'PONG GOD',
    '2000': 'PONG KHONVOUM',
  };

  const getEloTitle = (userData: UserData) => {
    let currentTitle = 'HOW IS THIS POSSIBLE';

    for (const range in titles) {
      if (userData.elo >= parseInt(range)) {
        currentTitle = titles[range];
      } else {
        break;
      }
    }
    return currentTitle;
  };

  if (userData == null) return <div className=' h-20'></div>;
  return <div className={` flex flex-row w-fit box-border bg-highlight font-jbmono tracking-normal transition-all duration-300 ease-in-out h-20 cursor-pointer`}>
    <div className={'w-20 h-20 aspect-square transition-all'}>
      <PixelatedImage src={userData.avatar} pixelSize={pixelSize} className='w-full' />
    </div>
    <div className={`flex flex-row overflow-hidden items-center transition-all duration-500 ease-in-out w-fit h-20`}>
      <div className='flex flex-col justify-center mx-5'>
        <div className=' text-2xl text-dimshadow font-extrabold'>{userData.userName}</div>
        <div className=' text-xs text-dimshadow'>{getEloTitle(userData)}</div>
      </div>
    </div>
    <div className={'h-20 transition-all duration-1000 ease-in-out'}>
      <ProfileElo expanded={false} elo={userData.elo} winning={userData.winning} />
    </div>
  </div>

  async function pixelatedToSmooth(start: number = 200) {
    let tmp = start;
    while (tmp > 1) {
      tmp = Math.floor(tmp / 1.05);
      if (tmp < 1) tmp = 1;
      setPixelSize(tmp);
      await sleep(10);
    }
  }
}

interface LobbyButtonProps {
  title?: string;
  onClick?: () => void;
  color?: string;
  selected?: boolean;
  active?: boolean;
}

function LobbyButton(props: LobbyButtonProps) {
  const { title, onClick, color, selected, active = true } = props;
  const [hover, setHover] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const hoverRef = React.useRef<HTMLDivElement>(null);

  const bg = useMemo(() => {
    if (color == null && hover) return 'bg-highlight'
    if (color == null) return 'bg-highlight/10'
    if (color === 'accCyan' && hover) return 'bg-accCyan'
    if (color === 'accCyan') return 'bg-accCyan/10'
    if (color === 'accRed' && hover) return 'bg-accRed'
    if (color === 'accRed') return 'bg-accRed/10'
  }, [color, hover]);

  const border = useMemo(() => {
    if (color == null && selected) return 'border-highlight'
    if (color == null) return 'border-highlight/10'
    if (color === 'accCyan' && selected) return 'border-accCyan'
    if (color === 'accCyan') return 'border-accCyan/10'
    if (color === 'accRed' && selected) return 'border-accRed'
    if (color === 'accRed') return 'border-accRed/10'
  }, [color, selected]);

  const text = useMemo(() => {
    if (color == null) return selected ? 'text-highlight' : 'text-highlight/20'
    if (color === 'accCyan') return selected ? 'text-accCyan' : 'text-accCyan/40'
    if (color === 'accRed') return selected ? 'text-accRed' : 'text-accRed/40'
  }, [color, selected]);

  return (
    <button
      ref={buttonRef}
      className={`relative box-border
        flex-1 ${bg} ${active && "cursor-pointer"} rounded-xl p-4
        group hover:${bg}
        border-[4px] ${border} transition-all duration-200 focus:outline-dimshadow`}
      onClick={onClick}
      onMouseEnter={() => setHover(active ? true : false)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={(e) => handleMouseMove(e)}
      disabled={!active}
    >
      <p className={`uppercase font-extrabold text-lg ${text} ${active && "group-hover:text-dimshadow"} text-center`} style={{ fontSize: "25px" }}>{title}</p>
      <div ref={hoverRef} className={`z-10 pointer-events-none font-jbmono rounded-lg border-highlight border-4 text-start bg-dimshadow absolute w-[400px] h-[228px] transition-opacity ease-in duration-200 ${hover ? " opacity-100" : " opacity-0"} `}>
        {imgLoaded ? null : <div className='w-full h-full flex justify-center rounded-[4px] items-center animate-pulse bg-highlight/50' />}
        <img src={title === 'boring' ? boringGIF : title === 'standard' ? standardGIF : deathGIF} height={200} width={400} className={` bg-clip-content rounded-[4px] ${imgLoaded ? "" : "hidden"}`} onLoad={() => imgOnLoad()} />
      </div>
    </button>
  )

  function imgOnLoad() {
    setImgLoaded(true);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (buttonRef.current == null || hoverRef.current == null) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    hoverRef.current.style.left = `${x + 20}px`;
    hoverRef.current.style.top = `${y - 228}px`;
  }
}

interface LobbyReadyButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  selected?: boolean;
  active?: boolean;
}

function LobbyReadyButton(props: LobbyReadyButtonProps) {
  const { onClick, children, selected = false, active = true } = props;
  return (
    <button
      className={`
        w-full ${selected ? "bg-highlight" : "bg-transparent  hover:bg-highlight/70"} cursor-pointer rounded-xl group
        border-[4px] border-highlight transition-all duration-200 focus:outline-dimshadow`}
      onClick={onClick}
      disabled={!active}
    >
      {children}
    </button>
  )
}