import React, { useState, useEffect, useRef, useMemo } from 'react'
import Card, { CardType } from '../components/Card';
import Terminal from './Terminal';
import Profile from '../widgets/Profile/Profile';
import MatrixRain from "../widgets/MatrixRain";
import Chat from '../widgets/Chat/Chat';
import { UserData } from '../model/UserData';
import { getProfileOfUser } from '../api/profileAPI';
import YoutubeEmbed from '../components/YoutubeEmbed';
import { friendListOf, getFriendList } from '../api/friendListAPI';
import { FriendData } from '../model/FriendData';
import Friendlist from '../widgets/Friends/Friendlist/Friendlist';
import FriendRequestPopup from '../widgets/Friends/FriendRequest/FriendRequestPopup';
import SocketApi from '../api/socketApi';
import Cowsay from '../widgets/TerminalCards/Cowsay';
import { ACTION_TYPE } from '../widgets/Friends/FriendAction/FriendActionCard';
import FriendAction from '../widgets/Friends/FriendAction/FriendAction';
import { FriendsContext, SelectedFriendContext } from '../contexts/FriendContext';
import UserContext from '../contexts/UserContext';
import { addFriend } from '../api/friendActionAPI';
import HelpCard from '../widgets/TerminalCards/HelpCard';
import { allCommands, friendCommands } from '../functions/commandOptions';
import { friendErrors } from '../functions/errorCodes';
import Leaderboard from '../widgets/Leaderboard/Leaderboard';
import Tfa from '../components/tfa';
import PreviewProfileContext from '../contexts/PreviewProfileContext';
import { ErrorData } from '../model/ErrorData';
import { gameData } from '../main';
import { CommandOptionData } from '../components/PromptField';
import { GameResponseDTO } from '../model/GameResponseDTO';
import login from '../api/loginAPI';

const availableCommands: CommandOptionData[] = [
  new CommandOptionData({ command: "help" }),
  new CommandOptionData({ command: "profile" }),
  new CommandOptionData({ command: "leaderboard" }),
  new CommandOptionData({ command: "friend", options: ["add", "list", "block", "unblock", "requests"], parameters: "<username>" }),
  new CommandOptionData({ command: "cowsay" }),
  new CommandOptionData({ command: "tfa", options: ["<OTP>", "set", "unset <OTP>", "forgot"] }),
  new CommandOptionData({ command: "sudo" }),
  new CommandOptionData({ command: "display" }),
  new CommandOptionData({ command: "start" }),
  new CommandOptionData({ command: "queue", options: ["standard", "boring", "death"] }),
  new CommandOptionData({ command: "dequeue" }),
  new CommandOptionData({ command: "clear" }),
  new CommandOptionData({ command: "end" }),
  new CommandOptionData({ command: "ok" }),
  new CommandOptionData({ command: "set" }),
  new CommandOptionData({ command: "reset" }),
  new CommandOptionData({ command: "logout" })
];

interface HomePageProps {
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  setUpdateUser: React.Dispatch<React.SetStateAction<boolean>>;
  userData: UserData;
}

function HomePage(props: HomePageProps) {
  const { setUserData, setUpdateUser, userData } = props;
  const [currentPreviewProfile, setCurrentPreviewProfile] = useState<UserData>(userData);
  const [elements, setElements] = useState<JSX.Element[]>([])
  const [index, setIndex] = useState(0);
  const [shouldDisplayGame, setShouldDisplayGame] = useState(false);
  const [topWidget, setTopWidget] = useState(<Profile />);
  const [midWidget, setMidWidget] = useState(<MatrixRain />);
  const [botWidget, setBotWidget] = useState(<Chat />);
  const [leftWidget, setLeftWidget] = useState<JSX.Element | null>(null);
  const [expandProfile, setExpandProfile] = useState(false);
  const [myFriends, setMyFriends] = useState<FriendData[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<FriendData[]>([]);
  const defaultSocket = useMemo(() => new SocketApi(), []);
  const friendshipSocket = useMemo(() => new SocketApi("friendship"), []);

  let incomingRequests: FriendData[] = useMemo(
    () => myFriends.filter(friend => (friend.status.toLowerCase() === "pending") && friend.sender.intraName !== userData.intraName),
    [myFriends]
  );

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initFriendshipSocket();
    gameData.setSetShouldDisplayGame = setShouldDisplayGame;

    getFriendList().then((friends) => {
      const newFriendsData = friends.data as FriendData[];
      setMyFriends(newFriendsData);
    });

    return () => {
      friendshipSocket.removeListener("friendshipRoom");
    }
  }, []);

  return (
    <PreviewProfileContext.Provider value={{ currentPreviewProfile: currentPreviewProfile, setPreviewProfileFunction: setCurrentPreviewProfile, setTopWidgetFunction: setTopWidget }}  >
      <UserContext.Provider value={{ defaultSocket: defaultSocket, myProfile: userData, setMyProfile: setUserData }}>
        <FriendsContext.Provider value={{ friendshipSocket: friendshipSocket, friends: myFriends, setFriends: setMyFriends }}>
          <SelectedFriendContext.Provider value={{ friends: selectedFriends, setFriends: setSelectedFriends }}>
            {shouldDisplayGame ? <MatrixRain></MatrixRain> :
              <div className='w-full h-full p-7'>
                {incomingRequests.length !== 0 && leftWidget === null && <FriendRequestPopup total={incomingRequests.length} setLeftWidget={setLeftWidget} />}
                <div className='flex flex-row w-full h-full overflow-hidden border-4 bg-dimshadow border-highlight rounded-2xl' ref={pageRef}>
                  <div className='flex-1 h-full'>
                    {leftWidget ? leftWidget : <Terminal availableCommands={availableCommands} handleCommands={handleCommands} elements={elements} />}
                  </div>
                  <div className='w-1 h-full bg-highlight' />
                  <div className=' h-full w-[700px] flex flex-col pointer-events-auto'>
                    {topWidget}
                    {midWidget}
                    {botWidget}
                  </div>
                </div>
              </div>
            }
          </SelectedFriendContext.Provider>
        </FriendsContext.Provider>
      </UserContext.Provider>
    </PreviewProfileContext.Provider>
  )

  function initFriendshipSocket() {
    friendshipSocket.listen("friendshipRoom", (data: any) => {
      getFriendList().then((friends) => {
        const newFriendsData = friends.data as FriendData[];
        setMyFriends(newFriendsData);
      });
    })
  }

  function handleCommands(command: string[]) {
    let newList: JSX.Element[] = [];
    switch (command[0]) {
      case "sudo":
        newList = appendNewCard(<YoutubeEmbed key={"rickroll" + index} />);
        break;
      case "cowsay":
        newList = appendNewCard(<Cowsay key={"cowsay" + index} index={index} commands={command.slice(1)} />);
        break;
      case "display":
        gameData.displayGame();
        break;
      case "start":
        gameData.startGame();
        break;
      case "queue":
        handleQueueCommand(command[1], newList);
        return;
      case "dequeue":
        handleDequeueCommand(newList);
        return;
      case "end":
        gameData.stopDisplayGame();
        gameData.endGame();
        break;
      case "profile":
        handleProfileCommand(command);
        return;
      case "friend":
        handleFriendCommand(command.slice(1));
        return;
      case "leaderboard":
        newList = elements;
        setMidWidget(<Leaderboard />);
        break;
      case "clear":
        newList = elements.filter((element) => element.type === YoutubeEmbed);
        setIndex(newList.length - 1);
        break;
      case "help":
        newList = appendNewCard(<HelpCard key={"help" + index} title="help" option='commands' usage='<command>' commandOptions={allCommands} />);
        break;
      case "ok":
        newList = appendNewCard(<Card key={"ok" + index} type={CardType.SUCCESS}>{"OK👌"}</Card>);
        break;
      case "tfa":
        newList = [<Tfa key={index} commands={command} />].concat(elements);
        setIndex(index + 1);
        break;
      case "reset":
        setUpdateUser(true);
        setUserData(userData);
        break;
      case "logout":
        document.cookie = "Authorization=;";
        window.location.assign("/");
        break;
      default:
        newList = appendNewCard(commandNotFoundCard());
        break;
    }
    setElements(newList);
  }

  function appendNewCard(newCard: JSX.Element | JSX.Element[]) {
    const newList = ([] as JSX.Element[]).concat(newCard, elements);
    setIndex(index + 1);
    return newList;
  }

  function commandNotFoundCard() {
    return <Card key={index} type={CardType.ERROR}>
      <p>Command not found... Get some <b className='font-extrabold'>help</b>.</p>
    </Card>;
  }

  function viewMyProfile() {
    const newProfileCard = <Profile expanded={!expandProfile} />;

    setTopWidget(newProfileCard);
    setCurrentPreviewProfile(userData);
    setTimeout(() => {
      setExpandProfile(!expandProfile);
    }, 500);
    return;
  }

  function handleProfileCommand(command: string[]) {

    let newList: JSX.Element[] = [];
    const errors: errorType[] = [];

    // handle profile
    if (command.length === 1) {
      viewMyProfile();
      return;
    }

    // handle profile <name>
    if (command.length === 2) {

      const wantToView: string = command[1];

      if (wantToView === userData.intraName) {
        viewMyProfile();
        return;
      }

      // should not able to view someone's profile if that person blocked you. treat as user not found
      if (myFriends.find((friend) => friend.sender.intraName === wantToView || friend.receiver.intraName === wantToView)?.status.toLowerCase() === "blocked") {
        errors.push({ error: friendErrors.USER_NOT_FOUND, data: wantToView });
        newList = newList.concat(generateErrorCards(errors, ACTION_TYPE.VIEW));
        setElements(appendNewCard(newList));
        return;
      }
      
      getProfileOfUser(wantToView)
        .then((response) => {
          const newPreviewProfile = response.data as any;
          newList = elements;
          const newProfileCard = <Profile expanded={true} />;
          setTopWidget(newProfileCard);
          setCurrentPreviewProfile(newPreviewProfile as UserData);
          setTimeout(() => {
            if (expandProfile)
              setExpandProfile(!expandProfile);
            else
              setExpandProfile(false);
          }, 500);
        })
        .catch((err: any) => {
          const error = err.response.data as ErrorData;
          if (error) {
            errors.push({ error: friendErrors.USER_NOT_FOUND, data: wantToView });
            newList = newList.concat(generateErrorCards(errors, ACTION_TYPE.VIEW));
            setElements(appendNewCard(newList));
            return;
          }
        });
    }

    // handle unknown profile command, push a help card
    if (command.length > 2) {
      newList = appendNewCard(<HelpCard key={"help" + index} title="profile" option='commands' usage='<command>' commandOptions={allCommands} />);
      setElements(newList);
      return;
    }
  }

  interface errorType {
    error: friendErrors;
    data: FriendData | UserData | string;
  }

  function generateErrorCards(errors: errorType[], action: string) {
    const newErrorCards: JSX.Element[] = [];
    let friend, friendName;

    if (errors.length > 0) {
      for (const errAttempt of errors) {
        let errIndex: number = 0;
        switch (errAttempt.error) {
          case friendErrors.CANNOT_PERFORM_ON_SELF:
            newErrorCards.push(<Card key={"CANNOT_ADD_SELF" + errIndex + index}>
              <p className='whitespace-pre'>I see... Trying to <span className='bg-accRed'>{action}</span> yourself huh? You can't do that.<br />Maybe consider to pay a visit to the nearest psychiatrist?</p>
            </Card>)
            break;
          case friendErrors.USER_NOT_FOUND:
            newErrorCards.push(<Card key={(errAttempt.data as string) + errIndex + index}>
              <p>Looks like you're trying to {action} a ghost. User not found: <span className='text-sm font-extrabold bg-accRed text-highlight'>{errAttempt.data as string}</span></p>
            </Card>)
            break;
          case friendErrors.FRIENDSHIP_EXISTED:
            friend = (errAttempt.data as FriendData);
            friendName = friend.receiver.intraName === userData.intraName ? friend.sender.intraName : friend.receiver.intraName;
            newErrorCards.push(<Card key={friendName + errIndex + index}>
              <p>Friendship with <span className="font-extrabold bg-accRed">{friendName}</span> existed! Current relationship: <span className='bg-highlight text-dimshadow'>{friend.status}</span></p>
            </Card>)
            break;
          case friendErrors.INVALID_RELATIONSHIP:
            friend = (errAttempt.data as FriendData);
            friendName = friend.receiver.intraName === userData.intraName ? friend.sender.intraName : friend.receiver.intraName;
            newErrorCards.push(<Card key={friendName + errIndex + index}>
              <p>Unable to {action} <span className="font-extrabold bg-accRed">{friendName}</span>. Current relationship: <span className='bg-highlight text-dimshadow'>{friend.status}</span></p>
            </Card>)
            break;
          case friendErrors.INVALID_OPERATION_ON_STRANGER:
            newErrorCards.push(<Card key={(errAttempt.data as string) + errIndex + index}>
              <p>Unable to {action} <span className="font-extrabold bg-accRed">{errAttempt.data as string}</span>. You two are not friends.</p>
            </Card>)
            break;
        }
        errIndex++;
      }
    }
    return newErrorCards;
  }

  function sendFriendRequestNotification(intraName: string) {
    friendshipSocket.sendMessages("friendshipRoom", { intraName: intraName });
  }

  async function addMultipleFriends(friendIntraNames: string[]) {

    const errors: errorType[] = [];
    const successes: string[] = [];
    let newCards: JSX.Element[] = [];

    if (friendIntraNames.includes(userData.intraName)) {
      errors.push({ error: friendErrors.CANNOT_PERFORM_ON_SELF, data: '' });
      friendIntraNames = friendIntraNames.filter((name) => name !== userData.intraName);
    }

    // iterate through the names and attempt get their user data to add as friend
    for (const friendName of friendIntraNames) {
      let friendProfile;

      try {
        friendProfile = (await getProfileOfUser(friendName)).data as UserData;
      } catch (error: any) {
        errors.push({ error: friendErrors.USER_NOT_FOUND, data: friendName as string });
        continue;
      }

      try {
        const tryAddFriend = await addFriend(friendProfile.intraName);
        successes.push(friendName);
      } catch (error: any) {
        errors.push({
          error: friendErrors.FRIENDSHIP_EXISTED,
          data: (myFriends.find((friend) => friend.receiver.intraName === friendName || friend.sender.intraName === friendName) as FriendData)
        });
      }
    }

    newCards = newCards.concat(generateErrorCards(errors, ACTION_TYPE.ADD));
    if (successes.length > 0) {
      for (const successName of successes) {
        newCards.push(
          <Card key={`${successName}_added` + index} type={CardType.SUCCESS}>
            <p>We've sent your friendship request to <span className='text-sm font-extrabold bg-accGreen text-highlight'>{successName}</span>. Finger crossed!</p>
          </Card>
        )
        sendFriendRequestNotification(successName);
      }

      const updatedFriendList = await getFriendList();
      setMyFriends(updatedFriendList.data);
    }
    setElements(appendNewCard(newCards));
  }

  function userDataToFriendData(receiverData: UserData): FriendData {
    const friend: FriendData = {
      id: receiverData.intraId,
      sender: userData,
      receiver: receiverData,
      status: "STRANGER",
    };
    return friend;
  }

  function belongsTotheDesireCategory(action: string, status: string) {
    if (action === ACTION_TYPE.BLOCK && (status === "ACCEPTED" || status === "PENDING")) return true;

    if (action === ACTION_TYPE.UNBLOCK && status === "BLOCKED") return true;

    if (action === ACTION_TYPE.UNFRIEND && (status === "ACCEPTED" || status === "BLOCKED" || status === "PENDING")) return true;

    return false;
  }

  async function performActionOnMultipleUsers(action: string, userIntraNames: string[]) {

    const newSelectedFriends: FriendData[] = [];
    const errors: errorType[] = [];
    let newCards: JSX.Element[] = [];

    if (userIntraNames.includes(userData.intraName)) {
      errors.push({ error: friendErrors.CANNOT_PERFORM_ON_SELF, data: '' });
      userIntraNames = userIntraNames.filter((name) => name !== userData.intraName);
    }

    let strangersNames: string[] = [];
    // for unblock and unfriend, need to get data from friend list
    userIntraNames.forEach((intraName) => {
      const friend = myFriends.find((friend) => friend.receiver.intraName === intraName || friend.sender.intraName === intraName);
      if (friend) {
        if (belongsTotheDesireCategory(action, friend.status))
          newSelectedFriends.push(friend);
        else
          errors.push({ error: friendErrors.INVALID_RELATIONSHIP, data: friend });
      }
      else {
        strangersNames.push(intraName);
      }
    });

    // get all stranger data
    const strangerProfiles = await Promise.all(strangersNames.map(intraName => getProfileOfUser(intraName)));

    // categorized user data
    const categorizedUsers = strangerProfiles.map((user, index) => {

      // user not found
      if ((user.data as ErrorData).error) return strangersNames[index];

      // user found but gurantee is a stranger
      const userData: UserData = user.data as UserData;
      return { user: userData, type: "STRANGER" };
    });

    for (const user of categorizedUsers) {
      if (typeof user === 'string') {
        errors.push({ error: friendErrors.USER_NOT_FOUND, data: user as string });
      } else if (typeof user === 'object' && user.type === "STRANGER") {
        if (action === ACTION_TYPE.BLOCK) {
          const fakeFriend = userDataToFriendData(user.user);
          newSelectedFriends.push(fakeFriend);
        } else {
          errors.push({ error: friendErrors.INVALID_OPERATION_ON_STRANGER, data: user.user.intraName });
        }
      }
    }

    newCards = newCards.concat(generateErrorCards(errors, action));
    setElements(appendNewCard(newCards));
    setSelectedFriends(newSelectedFriends);
    if (newSelectedFriends.length > 0)
      setLeftWidget(<FriendAction user={userData} useSelectedFriends={true} action={action} onQuit={() => setLeftWidget(null)} />);
  }

  async function showFriendList(intraName: string | null) {

    const errors: errorType[] = [];
    let newCards: JSX.Element[] = [];

    try {
      
      const friendProfile: UserData | ErrorData = (intraName === null) ? userData : (await getProfileOfUser(intraName)).data;
      
      try {
        let friendList: FriendData[] = (await friendListOf((friendProfile as UserData).intraName)).data; 
        if (intraName !== null) friendList = friendList.filter((friend) => friend.status === "ACCEPTED");
        setLeftWidget(<Friendlist userData={friendProfile as UserData} friends={friendList} onQuit={() => setLeftWidget(null)} />);
      } catch (error: any) {
        console.log("error when fetching friendlist");
      }

    } catch (error: any) {
      errors.push({ error: friendErrors.USER_NOT_FOUND, data: intraName as string });
    }

    newCards = newCards.concat(generateErrorCards(errors, ACTION_TYPE.VIEW));
    setElements(appendNewCard(newCards));
  }


  // PLEASE DO NOT SIMPLY REFACTOR THIS FUNCTION. SOMEONE REFACTORED THIS BEFORE AND IT BROKE THE FUNCTIONALITY
  // NEED TO SPEND AN HOUR TO FIND THE BUG. GAWD DAMN IT.
  async function handleFriendCommand(command: string[]) {
    let newList: JSX.Element[] = [];

    const updatedFriendlist = await getFriendList();
    setMyFriends(updatedFriendlist.data);

    if (command[0] === "list") {
      if (command.length === 1) {
        showFriendList(null);
      } else if (command.length === 2) {
        showFriendList(command[1]);
      }
      newList = elements;
    } else if (command[0] === "requests" && command.length === 1) {
      setLeftWidget(<FriendAction user={userData} action={ACTION_TYPE.ACCEPT} onQuit={() => setLeftWidget(null)} />);
      newList = elements;
    } else if (command[0] === "block" || command[0] === "unblock" || command[0] === "unfriend") {
      if (command.length === 1)
        setLeftWidget(<FriendAction user={userData} action={command[0]} onQuit={() => setLeftWidget(null)} />);
      else if (command.length >= 2) {
        performActionOnMultipleUsers(command[0], command.slice(1));
        return;
      }
      newList = elements;
    } else if (command[0] === "add" && command.length >= 2) {
      addMultipleFriends(command.slice(1));
      return;
    } else
      newList = appendNewCard(<HelpCard title="friend" usage="friend <option>" option="options" commandOptions={friendCommands} key={"friendhelp" + index} />);
    setElements(newList);
  }

  async function handleQueueCommand(argument: string, newList: JSX.Element[]) {
    let response: GameResponseDTO = await gameData.joinQueue(argument);
    if (response.type === "success")
      newList = appendNewCard(<Card key={"queue" + index} type={CardType.SUCCESS}>{`${response.message}`}</Card>)
    else
      newList = appendNewCard(<Card key={"queue" + index} type={CardType.ERROR}>{`${response.message}`}</Card>)
    setElements(newList);
  }

  async function handleDequeueCommand(newList: JSX.Element[]) {
    let response: GameResponseDTO = await gameData.leaveQueue();
    if (response.type === "success")
      newList = appendNewCard(<Card key={"dequeue" + index} type={CardType.SUCCESS}>{`${response.message}`}</Card>)
    setElements(newList);
  }
}

export default HomePage