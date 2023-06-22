import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import FriendlistTitle from './FriendlistTitle'
import EmptyFriendlist from './EmptyFriendlist';
import { UserData } from '../../../model/UserData';
import { FriendData, FriendTags } from '../../../model/FriendData';
import FriendlistEmptyLine from './FriendlistEmptyLine';
import FriendlistTag from './FriendlistTag';
import FriendInfo from './FriendInfo';
import UserContext from '../../../contexts/UserContext';
import { set } from 'lodash';

interface FriendlistProps {
  friends: FriendData[]; // need to be changed to compulsory
  userData: UserData;
  onQuit: () => void;
}

function Friendlist(props: FriendlistProps) {

  // Props
  const { friends, userData, onQuit } = props;

  // Use Hooks
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [maxDisplayLines, setMaxDisplayLines] = useState(0);
  const [startingIndex, setStartingIndex] = useState(0);
  const [endingIndex, setEndingIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const { myProfile } = useContext(UserContext);
  const [animate, setAnimate] = useState(false);

  // Filtered Raw data
  const acceptedFriends = useMemo(() => filterFriends(friends, FriendTags.accepted), []);
  const pendingFriends = useMemo(() => filterFriends(friends, FriendTags.pending), []);
  const blockedFriends = useMemo(() => filterFriends(friends, FriendTags.blocked), []);
  const sortedFriends = useMemo(() => acceptedFriends.concat(pendingFriends, blockedFriends), []);

  // convert sorted friends into lines
  const lines: JSX.Element[] = useMemo(() => createFriendlistComponents(sortedFriends), [sortedFriends]);

  // this should run when the component is mounted
  useEffect(() => {
    handleResize();
    focusOnInput();
    setAnimate(true);
    return observerSetup();
  }, []);

  useEffect(() => {
    if (inputValue === "")
      setIsSearching(false);
  }, [inputValue]);

  // calibrate the value of start and ending index
  useEffect(() => {
    if (maxDisplayLines > lines.length) {
      setEndingIndex(lines.length);
      setStartingIndex(0);
    }
    else
      setEndingIndex(startingIndex + maxDisplayLines - 1);
  }, [startingIndex])

  return (
    <div className='w-full h-full flex flex-col overflow-hidden text-base uppercase bg-dimshadow px-[2ch] relative' onClick={focusOnInput}>
      <input
        className='absolute w-0 h-0'
        onKeyDown={handleKeyDown}
        onChange={handleInput}
        value={inputValue}
        ref={inputRef}
      />
      {userData.intraName !== myProfile.intraName && <p className='bg-highlight text-dimshadow w-fit px-[1ch]'>Currently viewing <span className='bg-accCyan text-highlight'>{userData.userName}</span>'s friend list</p>}
      <div className={`flex flex-col w-full h-full overflow-hidden ${animate ? "" : " -translate-y-5 opacity-0"} transition-all duration-700`} ref={divRef}>
        {
          friends.length === 0
            ? <EmptyFriendlist userData={userData} />
            : lines.slice(startingIndex, endingIndex)
        }
      </div>
      <p className={`absolute bottom-0 left-0 ${friends.length === 0 ? '' : 'whitespace-pre'} transition-transform ${animate ? "" : " translate-y-full"} lowercase bg-highlight px-[1ch]`}>
        {
          (!isSearching || inputValue === "")
            ? `./usr/${userData.userName}/friends ${friends.length === 0 ? '' : `line [${startingIndex + 1}-${endingIndex}]/${lines.length}`}  press 'q' to quit`
            : inputValue
        }
      </p>
    </div>
  )

  // less: handle resize
  function handleResize() {
    if (divRef.current) {
      const height = divRef.current.clientHeight;
      const lineHeight = 24;
      const max = Math.floor(height / lineHeight);
      setMaxDisplayLines(max);
      (max - 1 < lines.length) ? setEndingIndex(max - 1) : setEndingIndex(lines.length);
    }
  }

  // less: observer div's changes
  function observerSetup() {
    const divElement = divRef.current as Element;
    const observer = new ResizeObserver(handleResize);

    if (divElement) {
      observer.observe(divElement);
    }
    return () => observer.unobserve(divElement);
  }

  // friendlist: filter friend based on status
  function filterFriends(friends: FriendData[], status: string) {
    if (status === "blocked")
      return friends.filter(friend => (friend.status.toLowerCase() === status) && friend.sender.intraName === userData.intraName);
    return friends.filter((friend) => friend.status.toLowerCase() === status);
  }

  // friendlist: create list of friend info component
  function createFriendlistComponents(sortedFriends: FriendData[]) {
    let prevCategory = '';
    let targetCategory: FriendData[] = [];
    let components: JSX.Element[] = [];

    if (sortedFriends.length === 0) return [<EmptyFriendlist userData={userData} />];

    components.push(
      <FriendlistEmptyLine key="el0" />,
      <FriendlistTitle key="friendlist_title" />
    );

    sortedFriends.map((friend) => {
      if (prevCategory !== friend.status) {

        switch (friend.status.toLowerCase()) {
          case "accepted":
            targetCategory = acceptedFriends;
            break;
          case "pending":
            targetCategory = pendingFriends;
            break;
          case "blocked":
            targetCategory = blockedFriends;
            break;
          default:
            break;
        }

        components.push(
          <FriendlistEmptyLine key={friend.status + `_el1`} />,
          <FriendlistTag key={friend.id + friend.status} type={friend.status} total={targetCategory.length} />,
          <FriendlistEmptyLine key={friend.status + `_el2`} />
        );
        prevCategory = friend.status;
      }
      components.push(
        <FriendInfo
          key={friend.id}
          friend={friend}
          intraName={userData.intraName}
        />)
    })
    return (components);
  }

  // less: focus on the hidden input field
  function focusOnInput() {
    inputRef.current?.focus();
  }

  // less/friendlist: handle keydown
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = event;
    const isLastLine = (startingIndex + maxDisplayLines > lines.length);
    const isFirstLine = startingIndex <= 0;

    // Backward one line
    if (key === "ArrowUp") {
      if (!isFirstLine) setStartingIndex(startingIndex - 1);
      return;
    }

    // Forward one line
    if (key === "ArrowDown") {
      if (!isLastLine) setStartingIndex(startingIndex + 1);
      return;
    }

    // Forward one line or Start searching
    if (key === "Enter") {
      if (inputValue === "" && !isLastLine) {
        setStartingIndex(startingIndex + 1);
      } else {
        setSearchTerm(inputValue.substring(1));
      }
      setInputValue("");
      return;
    }

    // Quit friendlist
    if (key === "q" && !isSearching) {
      setTimeout(() => onQuit(), 10);
      return;
    }
  }

  // less: handle input
  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    let value = e.currentTarget.value;

    if (value[value.length - 1] == '\\') value += '\\';

    setInputValue(value.toLowerCase());
    if (value[0] === '/') {
      return;
    }
    setInputValue("");
  }
}

export default Friendlist;