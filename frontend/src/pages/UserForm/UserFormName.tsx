import React, { useEffect, useState } from 'react'
import { UserData } from '../../model/UserData'

interface UserFormNameProps {
  user: UserData,
  awesomeSynonym: string,
  updateName: (name: string) => void,
  animate: boolean,
}

function UserFormName(props: UserFormNameProps) {
  const { animate } = props;
  const [userName, setUsername] = useState(props.user.userName);

  useEffect(() => {
    if (userName[0] === '@') {
      setUsername(userName.substring(1));
      props.updateName(userName.substring(1));
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className={`${animate ? "" : "opacity-0"} transition-opacity duration-500 font-semibold text-lg lg:text-xl`}>
        Your {props.awesomeSynonym} name
      </p>
      <p className={`${animate ? "" : "opacity-0"} transition-opacity duration-500 font-normal text-sm text-highlight/60`}>
        (Alphanumeric, '-', and '_' only)
      </p>
      <input
        className={`${animate ? "" : " scale-y-0 -translate-y-1/2"} transition-transform duration-700 bg-dimshadow border-highlight border-2 lg:border-4 rounded-md font-semibold text-xs sm:text-sm md:text-lg lg:text-xl p-2 lg:p-3 w-full focus:[outline:none] focus:animate-pulse-short cursor-text`}
        type="text"
        name="name"
        value={userName}
        autoComplete="off"
        onChange={handleOnchangeUsername}
      />
    </div>
  )

  function handleOnchangeUsername(e: React.FormEvent<HTMLInputElement>) {
    setUsername(e.currentTarget.value);
    props.updateName(e.currentTarget.value);
  }
}

export default UserFormName