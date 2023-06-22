import React from 'react'
import FriendlistSeparator from './FriendlistSeparator'

const TabWidth = {
  nickname: 16,
  intraName: 16,
  eloScore: 9,
  relationship: 12,
  status: 9,
}

function FriendlistTitle() {

  return (
    <div className='flex flex-row text-highlight'>
      <div className={`w-[${TabWidth.nickname}ch]`}>
        nickname
      </div>
      <FriendlistSeparator />
      <div className={`w-[${TabWidth.intraName}ch]`}>
        intra name
      </div>
      <FriendlistSeparator />
      <div className={`w-[${TabWidth.eloScore}ch] flex flex-row`}>
        elo
      </div>
      <FriendlistSeparator />
      <div className={`w-[${TabWidth.relationship}ch]`}>
        relationship
      </div>
      <FriendlistSeparator />
      <div className={`w-[${TabWidth.status}ch]`}>
        status
      </div>
    </div>
  )
}

export default FriendlistTitle