import React from 'react'

interface FriendlistTagType {
  type: string;
  total?: number;
}

const getFriendTagStyle = (type: string) => {
  let bgColor = `bg-dimshadow`, textColor = `text-highlight`;

  type = type.toLowerCase();
  if (type === "accepted")
    bgColor = `bg-accCyan`;
  else if (type === "incoming" || type === "outgoing" || type === "pending")
    bgColor = `bg-accYellow`;
  else if (type === "blocked")
    bgColor = `bg-accRed`;
  return (`${bgColor} ${textColor}`);
}

function FriendlistTag(props: FriendlistTagType) {

  let style;
  const { type, total } = props;

  style = getFriendTagStyle(type);
  return (
    <div className='flex flex-row gap-x-[1ch]'>
      <div className={`${style} text-center w-fit uppercase px-[1ch]`}>
        <>
          <p>{ type.toLowerCase() === "accepted" ? "friend" : type }{total !== undefined ? <span className='whitespace-pre text-highlight/50'>  {total}</span> : ''}</p>
        </>
      </div>
    </div>
  )
}

export default FriendlistTag