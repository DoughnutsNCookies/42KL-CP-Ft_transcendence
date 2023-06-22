interface LeaderboardPatternProps {
  align: string;
}

function LeaderboardPattern(props: LeaderboardPatternProps) {

  const { align } = props;

  return (
    <div
      className={`w-full h-full flex flex-col py-1.5 justify-between`}
      style={{ alignItems: (align === "start" ? "flex-start" : "flex-end") }}
    >
      <span className='bg-accRed text-accRed w-[100%] h-[25%]'></span>
      <span className='bg-accCyan text-accCyan w-[50%] h-[25%]'></span>
      <span className='bg-accYellow text-accYellow w-[25%] h-[25%]'></span>
    </div>
  )
}

export default LeaderboardPattern