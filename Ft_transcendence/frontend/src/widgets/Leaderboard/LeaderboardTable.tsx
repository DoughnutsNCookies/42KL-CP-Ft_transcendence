import React, { useContext, useState } from 'react'
import ScrollView from '../../components/ScrollView';
import { LeaderboardUser } from '../../model/leadeboardUser';
import { getHallOfFame, getHallOfShame } from '../../api/leaderboardAPIs';
import PreviewProfileContext from '../../contexts/PreviewProfileContext';
import { getProfileOfUser } from '../../api/profileAPI';
import { UserData } from '../../model/UserData';
import Profile from '../Profile/Profile';

interface LeaderboardTableRowProps {
  index: number;
  name: string;
  intraId: string;
  eloRating: number;
}

function LeaderboardTableTitle() {
  return (
    <>
      <div className='px-6 flex flex-row uppercase text-lg text-highlight font-extrabold'>
        <p className='w-[7%]'>#</p>
        <p className='w-[70%] pl-1.5'>name</p>
        <p className='w-[23%] pr.1.5'>ELO</p>
      </div>
      <div className=' h-[2px] mt-2 w-full bg-highlight' />
    </>
  )
}

function LeaderboardTableRow(props: LeaderboardTableRowProps) {

  const { index, name, intraId, eloRating } = props;
  const [isHovered, setIsHovered] = useState(false);
  const { setPreviewProfileFunction, setTopWidgetFunction } = useContext(PreviewProfileContext);

  let borderColor: string = "border-transparent";
  if (index === 0) {
    borderColor = "border-yellow-500";
  } else if (index === 1) {
    borderColor = "border-accCyan";
  } else if (index === 2) {
    borderColor = "border-accRed";
  }

  let bgColor: string = "bg-transparent";
  if (isHovered) {
    if (index === 0) {
      bgColor = "bg-yellow-500";
    } else if (index === 1) {
      bgColor = "bg-accCyan";
    } else if (index === 2) {
      bgColor = "bg-accRed";
    } else {
      bgColor = "bg-highlight";
    }
  }
  let textColor: string;
  if (isHovered) {
    textColor = "text-dimshadow";
  } else {
    textColor = "text-highlight";
  }

  return (
    <div className='bg-transparent pt-3 px-1'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onMouseDown}
    >
      <button className={` text-start snap-center flex flex-row w-full uppercase p-4 border-dashed border-4 transition-all ease-linear duration-150 ${borderColor} ${bgColor} ${textColor}`}
      >
        <p className='w-[7%]'>{Number(index) + 1}</p>
        <p className='w-[70%]'>{name} </p>
        <p className='w-[23%]'>{eloRating}</p>
      </button>
    </div>
  )

  function onMouseDown() {
    getProfileOfUser(intraId).then((res) => {
      if (res.data) {
        setPreviewProfileFunction(res.data as UserData);
        setTopWidgetFunction(<Profile expanded={true} />)
      }
    });
  }
}

// testing
const users = [
  {
    id: 0,
    name: "joemama",
    intraId: "jmama",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 1,
  },
  {
    id: 1,
    name: "janedoe",
    intraId: "jadoe",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 4,
  },
  {
    id: 2,
    name: "babeeboobu",
    intraId: "bbbb",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 10,
  },
  {
    id: 3,
    name: "ineedsleep",
    intraId: "inesl",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 10,
  },
  {
    id: 4,
    name: "konichiwa",
    intraId: "kncw",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 21,
  },
  {
    id: 5,
    name: "loliloli",
    intraId: "lol",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 35,
  },
  {
    id: 6,
    name: "krapkumkap",
    intraId: "krakap",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 40,
  },
  {
    id: 7,
    name: "brrrice",
    intraId: "brce",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 42,
  },
  {
    id: 8,
    name: "hello",
    intraId: "hlo",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 48,
  },
  {
    id: 9,
    name: "shawn tee young",
    intraId: "shawty",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 52,
  },
  {
    id: 10,
    name: "hello",
    intraId: "hlo",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 48,
  },
  {
    id: 11,
    name: "hell",
    intraId: "hl",
    intraURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    eloRating: 48,
  },
]

interface LeaderboardTableProps {
  leaderboardUsers: LeaderboardUser[];
  appendLeaderBoardUsers: (users: LeaderboardUser[]) => void;
  type: "hallOfFame" | "hallOfShame";
}

function LeaderboardTable(props: LeaderboardTableProps) {
  const { leaderboardUsers, type, appendLeaderBoardUsers } = props;

  return (
    <div className='flex flex-col flex-1 overflow-hidden text-sm font-extrabold text-highlight'>
      <LeaderboardTableTitle />
      <div className='overflow-auto w-full flex-1 scrollbar-hide'
        onScroll={handleScroll}
      >
        {
          leaderboardUsers.map((user, index) =>
            <LeaderboardTableRow
              key={index}
              index={index}
              name={user.userName}
              intraId={user.intraName}
              eloRating={user.elo}
            />)
        }
      </div>
    </div>
  )

  function handleScroll(e: any) {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (leaderboardUsers.length % 30 > 0) return;
    if (bottom) {
      if (type === "hallOfFame") {
        getHallOfFame(Math.floor(leaderboardUsers.length / 30), 30).then((users) => {
          appendLeaderBoardUsers(users);
        });
      }
      else if (type === "hallOfShame") {
        getHallOfShame(Math.floor(leaderboardUsers.length / 30), 30).then((users) => {
          appendLeaderBoardUsers(users);
        });
      }
    }
  }
}

export default LeaderboardTable