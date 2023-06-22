import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import FriendActionCard, { ACTION_TYPE } from './FriendActionCard'
import LessFileIndicator from '../../Less/LessFileIndicator'
import { FriendData } from '../../../model/FriendData'
import { UserData } from '../../../model/UserData'
import { ActionCardsContext, ActionFunctionsContext, FriendActionContext, FriendsContext, SelectedFriendContext } from '../../../contexts/FriendContext'
import { acceptFriend, blockExistingFriend, blockStranger, deleteFriendship } from '../../../api/friendActionAPI'
import { AxiosResponse } from 'axios'
import { getFriendList } from '../../../api/friendListAPI'
import { ErrorPopup } from '../../../components/Popup'

interface FriendActionProps {
  user: UserData;
  action: string;
  useSelectedFriends?: boolean;
  onQuit: () => void;
}

function getFileName(action: string) {
  switch (action) {
    case ACTION_TYPE.ACCEPT:
      return "requests";
    default:
      return action;
  }
}

function FriendAction(props: FriendActionProps) {

  // props
  const { user, action, useSelectedFriends, onQuit } = props;
  const fileString = `./usr/${user.userName}/friend/${getFileName(action)} `;

  // hooks
  const { friends } = useContext(FriendsContext);
  const [isInputFocused, setIsInputFocused] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [commandNotFound, setCommandNotFound] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [outputStyle, setOutputStyle] = useState("bg-accRed");
  const [outputStr, setOutputStr] = useState("");
  const { setFriends } = useContext(FriendsContext);
  const { friends: selectedFriends, setFriends: setSelectedFriends } = useContext(SelectedFriendContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [animate, setAnimate] = useState(false);
  const [hasErrorProcessingRequest, setHasErrorProcessingRequest] = useState(false);

  let actionCards: JSX.Element[] = [];
  let yesAction: (name: string) => Promise<AxiosResponse>;
  let noAction: (name: string) => Promise<AxiosResponse>;

  const filteredFriends: FriendData[] = useSelectedFriends !== undefined ? selectedFriends : filterFriends();

  setActionFunctions();
  createFriendActionCards();

  useEffect(() => {
    setAnimate(true);
    focusOnInput();
    setActionFunctions();
  }, []);

  useLayoutEffect(() => {
    createFriendActionCards();
  }, []);

  useEffect(() => {
    if (hasErrorProcessingRequest) {
      const timeoutId = setTimeout(() => {
        setHasErrorProcessingRequest(false);
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      }
    }
  }, [hasErrorProcessingRequest])

  return (
    <FriendActionContext.Provider value={action}>
      <ActionCardsContext.Provider value={{ actionCards, selectedIndex, setSelectedIndex }}>
        <ActionFunctionsContext.Provider value={{ yesAction: handleYesAction, noAction: handleNoAction, alternativeAction: blockStrangerAction }}>
          <div className='flex flex-col justify-end w-full h-full overflow-hidden text-base bg-dimshadow relative' onClick={focusOnInput}>
            <input
              className='absolute w-0 h-0'
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={handleKeyDown}
              onChange={handleInput}
              value={inputValue}
              ref={inputRef}
            />
            {hasErrorProcessingRequest && (<div className='absolute top-10 right-0'>
              <ErrorPopup text='Friendship not found! Please refresh your friend list :(' />
            </div>)}
            <div className={`px-[2ch] flex flex-col-reverse ${animate ? "" : " translate-y-12 opacity-0"} transition-all duration-1000q`}>
              {actionCards.length === 0 ? <></> : actionCards.slice(selectedIndex)}
            </div>
            <p className={`px-[2ch] text-highlight ${outputStyle} w-fit ${commandNotFound || showOutput ? 'visible' : 'invisible'}`}>{outputStr}</p>
            <div className={`${isInputFocused ? '' : 'opacity-70'} flex flex-row px-[1ch] bg-highlight whitespace-pre w-fit h-fit text-dimshadow ${animate ? "" : " -translate-x-24 opacity-0"} transition-all duration-500`}>
              {
                inputValue === ""
                  ? <><LessFileIndicator fileString={fileString} /> {filteredFriends.length !== 0 && `${selectedIndex + 1}/${filteredFriends.length}`} <p>press 'q' to quit</p></>
                  : <p>{inputValue}</p>
              }
            </div>
            <div className={`flex-col ${animate ? "" : " translate-y-full"} transition-all duration-500`}>
              <div className='flex flex-row justify-between'>
                <button className='text-highlight hover:text-dimshadow hover:bg-highlight' onClick={() => handleFriendAction('Y')}><span className='bg-highlight text-dimshadow'>:Y</span> Yes to all</button>
                <button className='text-highlight hover:text-dimshadow hover:bg-highlight' onClick={() => handleFriendAction('N')}><span className='bg-highlight text-dimshadow'>:N</span> No to all</button>
                {action === ACTION_TYPE.ACCEPT ? <button className='text-highlight hover:text-dimshadow hover:bg-highlight' onClick={() => handleFriendAction('I')}><span className='bg-highlight text-dimshadow'>:I</span> Ignore all</button> : <></>}
                <span></span>
              </div>
              <div className='flex flex-row justify-between'>
                <button className='text-highlight hover:text-dimshadow hover:bg-highlight ' onClick={() => handleFriendAction('y')}><span className='bg-highlight text-dimshadow'>:y</span> yes to current</button>
                <button className='text-highlight hover:text-dimshadow hover:bg-highlight' onClick={() => handleFriendAction('n')}><span className='bg-highlight text-dimshadow'>:n</span> no to current</button>
                {action === ACTION_TYPE.ACCEPT ? <button className='text-highlight hover:text-dimshadow hover:bg-highlight' onClick={() => handleFriendAction('i')}><span className='bg-highlight text-dimshadow'>:i</span> ignore current</button> : <></>}
                <span></span>
              </div>
            </div>
          </div>
        </ActionFunctionsContext.Provider>
      </ActionCardsContext.Provider>
    </FriendActionContext.Provider>
  )

  function focusOnInput() {
    inputRef.current?.focus();
    setIsInputFocused(true);
  }

  function handleFriendAction(action: string) {
    runFriendActionCommands(action);
    setIsCommandMode(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {

    const { key } = event;

    if (key === "ArrowUp" && selectedIndex < filteredFriends.length - 1)
      setSelectedIndex(selectedIndex + 1);

    if (key === "ArrowDown" && selectedIndex > 0)
      setSelectedIndex(selectedIndex - 1);

    if (key === "Enter" && inputValue !== "") {
      runFriendActionCommands(inputValue.slice(1));
      setInputValue("");
      setIsCommandMode(false);
    }

    if (key === "q" && !isCommandMode) {
      setTimeout(() => onQuit(), 10);
      return;
    }
  }

  function setActionFunctions() {
    switch (action) {
      case ACTION_TYPE.ACCEPT:
        yesAction = acceptFriend;
        noAction = deleteFriendship;
        break;
      case ACTION_TYPE.BLOCK:
        yesAction = blockExistingFriend;
        break;
      case ACTION_TYPE.UNBLOCK:
        yesAction = deleteFriendship;
        break;
      case ACTION_TYPE.UNFRIEND:
        yesAction = deleteFriendship;
        break;
      default:
        break;
    }
  }

  function cleanUpSelectedFriends() {
    if (selectedFriends === undefined) return;

    const newSelectedFriends = [...selectedFriends.slice(0, selectedIndex), ...selectedFriends.slice(selectedIndex + 1)];
    setSelectedFriends(newSelectedFriends);
  }

  function handleYesAction(friendIntraName: string, shouldShow: boolean) {
    yesAction(friendIntraName)
      .then(() => getFriendList())
      .then((data) => {
        setFriends(data.data);
        cleanUpSelectedFriends();
        const newActionCards = [...actionCards.slice(0, selectedIndex), ...actionCards.slice(selectedIndex + 1)];
        if (selectedIndex >= newActionCards.length) {
          setSelectedIndex(newActionCards.length - 1);
        } else {
          setSelectedIndex(selectedIndex);
        }
        actionCards = newActionCards;
        if (shouldShow) {
          if (action !== ACTION_TYPE.UNFRIEND) setOutputStyle("bg-accCyan");
          setOutputStr(getOutputString(friendIntraName));
          setShowOutput(true);
        }
      })
      .catch(err => setHasErrorProcessingRequest(true));
  }

  function handleNoAction(friendIntraName: string, shouldShow: boolean) {
    noAction(friendIntraName)
      .then(() => getFriendList())
      .then((data) => {
        setFriends(data.data);
        cleanUpSelectedFriends();
        const newActionCards = [...actionCards.slice(0, selectedIndex), ...actionCards.slice(selectedIndex + 1)];
        if (selectedIndex >= newActionCards.length) {
          setSelectedIndex(newActionCards.length - 1);
        } else {
          setSelectedIndex(selectedIndex);
        }
        actionCards = newActionCards;
        if (shouldShow) {
          setOutputStyle("bg-accRed");
          setOutputStr(`You rejected friend request from '${friendIntraName}'`);
          setShowOutput(true);
        }
      })
      .catch(err => setHasErrorProcessingRequest(true));
  }

  function blockStrangerAction(strangerIntraName: string, shouldShow: boolean) {
    blockStranger(strangerIntraName)
      .then(() => getFriendList())
      .then((data) => {
        setFriends(data.data);
        cleanUpSelectedFriends();
        const newActionCards = [...actionCards.slice(0, selectedIndex), ...actionCards.slice(selectedIndex + 1)];
        if (selectedIndex >= newActionCards.length) {
          setSelectedIndex(newActionCards.length - 1);
        } else {
          setSelectedIndex(selectedIndex);
        }
        actionCards = newActionCards;
        if (shouldShow) {
          setOutputStyle("bg-accRed");
          setOutputStr(getOutputString(strangerIntraName));
          setShowOutput(true);
        }
      })
      .catch(err => setHasErrorProcessingRequest(true));
  }

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    let value = e.currentTarget.value;

    if (value === "") {
      setIsCommandMode(false);
    }

    if (value !== "") {
      setCommandNotFound(false);
      setShowOutput(false);
    }

    if (value[0] !== 'q' && value[0] !== ':') {
      setInputValue("");
      return;
    }

    if (value[0] === ':') {
      setIsCommandMode(true);
    }

    setInputValue(value);
  }

  function createFriendActionCards() {
    filteredFriends.map((friend, index) =>
      actionCards.push(
        <FriendActionCard
          key={friend.id}
          index={index}
          friend={friend}
          user={user}
          ignoreAction={ignoreAction}
        />
      )
    )
  }

  function ignoreAction() {
    if (selectedIndex < filteredFriends.length - 1)
      setSelectedIndex(selectedIndex + 1);
  }

  function getOutputString(friendUserName: string) {
    switch (action) {
      case ACTION_TYPE.ACCEPT:
        return `'${friendUserName}' is your friend now! HOORAY!`
      case ACTION_TYPE.BLOCK:
        return `'${friendUserName}' has been blocked. :(`
      case ACTION_TYPE.UNBLOCK:
        return `'${friendUserName}' has been unblocked. You need to send another friend request to be his/her friend again.`
      case ACTION_TYPE.UNFRIEND:
        return `'${friendUserName}' has been unfriended. Bye bye friend...`
      default:
        return '';
    }
  }

  function runFriendActionCommands(command: string) {

    if (yesAction === undefined || noAction === undefined) setActionFunctions();

    if (command === "y") {
      const friend = filteredFriends[selectedIndex];
      const friendIntraName = (user.intraName === friend.receiver.intraName ? friend.sender.intraName : friend.receiver.intraName);
      if (friend.status === "STRANGER")
        blockStrangerAction(friendIntraName, true);
      else
        handleYesAction(friendIntraName, true);
    } else if (command === "Y") {
      const friendList = useSelectedFriends ? selectedFriends : filteredFriends;
      for (const friend of friendList) {
        const friendIntraName = (user.intraName === friend.receiver.intraName ? friend.sender.intraName : friend.receiver.intraName);
        if (friend.status === "STRANGER")
          blockStrangerAction(friendIntraName, false);
        else
          handleYesAction(friendIntraName, false);
      }
    } else if (command === "n") {
      if (action !== ACTION_TYPE.ACCEPT) {
        ignoreAction();
      } else {
        const friend = filteredFriends[selectedIndex];
        const friendIntraName = (user.intraName === friend.receiver.intraName ? friend.sender.intraName : friend.receiver.intraName);
        handleNoAction(friendIntraName, true);
      }
    } else if (command === "N") {
      if (action !== ACTION_TYPE.ACCEPT) {
        setTimeout(() => onQuit(), 10);
      } else {
        const friendList = useSelectedFriends ? selectedFriends : filteredFriends;
        for (const friend of friendList) {
          const friendIntraName = (user.intraName === friend.receiver.intraName ? friend.sender.intraName : friend.receiver.intraName);
          handleNoAction(friendIntraName, false);
        }
      }
    } else if ((command === "i") && action === ACTION_TYPE.ACCEPT) {
      ignoreAction();
    } else if ((command === "I") && action === ACTION_TYPE.ACCEPT) {
      setTimeout(() => onQuit(), 10);
    } else {
      setOutputStr(`Command not found: ${command}`);
      setCommandNotFound(true);
    }
  }

  function filterFriends() {
    switch (action) {
      case ACTION_TYPE.ACCEPT:
        return friends.filter(friend => (friend.status.toLowerCase() === "pending") && friend.sender.intraName != user.intraName);
      case ACTION_TYPE.BLOCK:
        return friends.filter(friend => ((friend.status.toLowerCase() === "accepted") || (friend.status.toLowerCase() === "pending")));
      case ACTION_TYPE.UNBLOCK:
        return friends.filter(friend => (friend.status.toLowerCase() === "blocked") && friend.sender.intraName === user.intraName);
      case ACTION_TYPE.UNFRIEND:
        return friends.filter(friend => (friend.status.toLowerCase() === "accepted"
          || (friend.status.toLowerCase() === "blocked" && friend.sender.intraName === user.intraName)
          || (friend.status.toLowerCase() === "pending" && friend.sender.intraName === user.intraName)));
      default:
        return [];
    }
  }
}

export default FriendAction