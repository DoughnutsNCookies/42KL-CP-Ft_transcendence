import { MatchData } from '../../../model/MatchData'
import { FaBed, FaBolt, FaCrown, FaSkull, FaTrash } from 'react-icons/fa'
import { TbPlugConnectedX } from 'react-icons/tb';

interface MatchCardProps {
  data: MatchData;
}

function MatchCard(props: MatchCardProps) {
  const { data } = props;
  const { player1, player2, player1Score, player2Score, gameType, winner, wonBy } = data;
  return (
    <div className='flex flex-row '>
      <div className='flex flex-row items-center justify-between w-full h-fit py-2 px-4 border-2 border-r-0 border-highlight border-dashed text-highlight font-extrabold text-lg uppercase'>
        <div className='mx-auto h-full'>
          {winner === player1.intraName ? <FaCrown className="text-yellow-400" size={25}/> : wonBy === "score" ? <FaTrash className="text-gray-500" size={20}/> : <TbPlugConnectedX className='text-accRed' size={20}/>}
        </div>
        <p className='w-[30%] text-center truncate font-bold'>{player1.userName}</p>
        <p className='text-center text-2xl flex-1'>{player1Score}:{player2Score}</p>
        <p className='w-[30%] text-center truncate font-bold'>{player2.userName}</p>
        <div className='mx-auto h-full'>
          {winner === player2.intraName ? <FaCrown className="text-yellow-400" size={25}/> : wonBy === "score" ? <FaTrash className="text-gray-500" size={20}/> : <TbPlugConnectedX className='text-accRed' size={10}/>}
        </div>
      </div>
      <div className={`aspect-square w-[57px] border-[2px] ${gameType === 'boring' ? 'bg-highlight' : gameType === 'standard' ? 'bg-accCyan' : 'bg-accRed'}`}>
        {gameType === 'boring' ? <FaBed className='mx-auto h-full text-shadow' size={30}/> : gameType === 'standard' ? <FaBolt className='mx-auto h-full text-dimshadow' size={20}/> : <FaSkull className='mx-auto h-full text-dimshadow' size={30}/>}
      </div>
    </div>
  )
}

export default MatchCard