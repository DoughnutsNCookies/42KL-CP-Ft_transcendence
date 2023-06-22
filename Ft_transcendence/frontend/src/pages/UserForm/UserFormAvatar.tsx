import React, { useEffect, useRef, useState } from 'react'
import { UserData } from '../../model/UserData'
import { toDataUrl } from '../../functions/toDataURL';

interface UserFormAvatarProps {
  intraName: string,
  avatarUrl: string,
  setAvatar: (newAvatar: string) => void,
  setFileExtension: (ext: string) => void,
  animate: boolean,
}

function UserFormAvatar(props: UserFormAvatarProps) {

  const { intraName, avatarUrl, setAvatar, setFileExtension, animate } = props;
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputFileRef.current?.click();
  }

  const handleChangeAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();

    // define a callback function to be called when the file is loaded
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatar(reader.result as string);
      }
    };
    reader.readAsDataURL(e.target.files![0]);
  }

  return (
    <div className={`${animate ? "" : " scale-y-0"} transition-transform duration-500 flex flex-col w-[50%] h-fit max-w-md rounded-2xl overflow-hidden border-highlight border-4`}>
      <img className='h-full w-full object-cover aspect-square lg:aspect[0.5/0.5]' src={avatarUrl} alt={`${intraName}'s avatar`} />
      <div
        className='py-2 font-semibold text-center capitalize cursor-pointer select-none text-dimshadow hover:text-highlight bg-highlight hover:bg-dimshadow lg:py-3 lg:font-extrabold transition hover:ease-in-out'
        onClick={handleButtonClick}
      >
        Upload new avatar
      </div>
      <input
        className='hidden'
        type="file"
        accept=".jpg, .jpeg, .png"
        ref={inputFileRef}
        onChange={handleChangeAvatar}
      />
    </div>
  )
}

export default UserFormAvatar