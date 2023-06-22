import React, { useEffect, useMemo, useState } from 'react'
import UserFormAvatar from './UserFormAvatar';
import { UserData } from '../../model/UserData';
import UserFormName from './UserFormName';
import UserFormQuestion from './UserFormQuestion';
import { getAwesomeSynonym, getRandomIceBreakingQuestion } from '../../functions/fun';
import { ErrorPopup } from '../../components/Popup';
import { dataURItoFile, toDataUrl } from '../../functions/toDataURL';
import Api from '../../api/api';
import sleep from '../../functions/sleep';
import login from '../../api/loginAPI';
import { FaArrowLeft } from 'react-icons/fa';
import UserFormTfa from './UserFormTfa';
import { ErrorData } from '../../model/ErrorData';

interface IAPIResponse {
  intraId: number,
  userName: string,
  intraName: string,
  elo: number,
  accessToken: string,
  avatar: string,
  tfaSecret: string,
  error: string
}

enum ErrorCode {
  IMAGETOOBIG,
  NAMETOOSHORT,
  NAMETOOLONG,
  NAMEINVALID,
  NAMETAKEN,
  EMPTYNAME,
  EMPTYANS,
  TFANOTVERIFIED
}

const getError = (code: ErrorCode) => {

  switch (code) {
    case ErrorCode.EMPTYNAME:
      return ("We need your name, not your silence!");
    case ErrorCode.EMPTYANS:
      return ("No answer? OK! We'll just sit here and wait...");
    case ErrorCode.NAMETOOSHORT:
      return ("Longer name, please. (MIN: 1 chars)");
    case ErrorCode.NAMETOOLONG:
      return ("Name too epic, please shorten. (MAX: 16 chars)");
    case ErrorCode.IMAGETOOBIG:
      return ("Image too good, make it smaller. (MAX: 3MB)")
    case ErrorCode.NAMETAKEN:
      return ("Epic name taken, please choose another one.");
    case ErrorCode.NAMEINVALID:
      return ("Names like Elon Musk's son not allowed");
    case ErrorCode.TFANOTVERIFIED:
      return ("2FA not verified yet. 2 bad 2 furious!");
    default:
      return ("Error 42: Unknown error occurred");
  }
}

interface UserFormProps {
  userData: UserData;
  isUpdatingUser: boolean;
  setIsUpdatingUser: React.Dispatch<React.SetStateAction<boolean>>;
}

function UserForm(props: UserFormProps) {

  // Props
  const { userData, isUpdatingUser, setIsUpdatingUser } = props;

  // Hooks
  const [avatar, setAvatar] = useState('');
  const [userName, setFinalName] = useState(userData.userName);
  const [fileExtension, setFileExtension] = useState<string>('jpeg');
  const [questionAns, setQuestionAns] = useState("");
  const awesomeSynonym = useMemo(() => getAwesomeSynonym(), []);
  const iceBreakingQuestion = useMemo(() => getRandomIceBreakingQuestion(), []);
  const [popups, setPopups] = useState<JSX.Element[]>([]);
  const [tfaCode, setTfaCode] = useState<string>('');
  const [isVerifyingTFA, setIsVerifyingTFA] = useState(false);
  const [isTFAEnabled, setIsTFAEnabled] = useState(userData.tfaSecret === "ENABLED");
  const [TFAVerified, setTFAVerified] = useState(false);

  // animations
  const [slideIn1, setSlideIn1] = useState(false);
  const [slideIn2, setSlideIn2] = useState(false);
  const [slideIn3, setSlideIn3] = useState(false);
  const [slideIn4, setSlideIn4] = useState(false);

  useEffect(() => {
    setSlideIn1(true);
    setTimeout(() => {
      setSlideIn2(true);
    }, 300);
    setTimeout(() => {
      setSlideIn3(true);
    }, 600);
    setTimeout(() => {
      setSlideIn4(true);
    }, 1000);
  }, []);

  // convert the image from intra to data:base64
  useEffect(() => {
    toDataUrl(userData.avatar)
      .then((res) => setAvatar(res))
  }, []);

  return (
    <div className=''>
      <div className='z-30 flex flex-col items-end w-full gap-2 mt-6 h-fit lg:gap-4'>
        {popups}
      </div>
      {
        // extra feature: check if the user actually modified their name and avatar or not. If they did, ask for confirmation before back to homepage
        isUpdatingUser &&
        <button className={`${slideIn1 ? "" : " -translate-y-3 opacity-0"} absolute top-8 left-8 h-fit p-3 rounded-md bg-highlight text-center cursor-pointer flex flex-row gap-x-3 items-center group hover:bg-dimshadow border-highlight border-2 transition-all duration-200 focus:outline-dashed focus:outline-[3px] focus:outline-highlight`} onClick={() => setIsUpdatingUser(false)}>
          <FaArrowLeft className='text-xl font-extrabold text-dimshadow group-hover:text-highlight' />
          <span className='text-xl font-extrabold group-hover:text-highlight'>BACK</span>
        </button>
      }
      <div className='flex flex-row w-[80%] h-fit justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-5 lg:gap-10'>
        <UserFormAvatar intraName={userData.intraName} avatarUrl={avatar} setAvatar={setAvatar} setFileExtension={setFileExtension} animate={slideIn1} />
        <div className='w-[48%] lg:w-[40%] h-full my-auto flex flex-col font-extrabold text-highlight gap-3'>
          <p className={`${slideIn1 ? "" : " translate-x-12 opacity-0"} transition-all duration-300 uppercase text-base lg:text-xl text-dimshadow bg-highlight w-fit p-2 lg:p-3 font-semibold lg:font-extrabold`}>user info</p>
          <UserFormName user={userData} awesomeSynonym={awesomeSynonym} updateName={updateName} animate={slideIn2} />
          <UserFormQuestion question={iceBreakingQuestion} answer={questionAns} updateAnswer={updateAnswer} animate={slideIn3} />
          {isVerifyingTFA && <UserFormTfa tfaCode={tfaCode} setTfaCode={setTfaCode} tfaVerified={TFAVerified} setTFAVerified={setTFAVerified} handleSubmit={handleSubmit} />}
          <button className={`${slideIn4 ? "" : " -translate-y-3 opacity-0"} transition-all duration-300 ${isVerifyingTFA && 'hidden'} font-semibold lg:font-extrabold flex-1 w-full h-full bg-highlight hover:bg-dimshadow text-dimshadow hover:text-highlight border-2 border-highlight text-center p-2 lg:p-3 text-base lg:text-lg cursor-pointer transition hover:ease-in-out focus:outline-dimshadow ${isVerifyingTFA && !TFAVerified && 'focus:bg-highlight'}`} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  )

  function updateName(name: string) {
    setFinalName(name);
  }

  function updateAnswer(ans: string) {
    setQuestionAns(ans);
  }

  function checkNameAndAnswer() {
    let errors: ErrorCode[] = new Array();

    if (!userName || userName.trim() === '')
      errors.push(ErrorCode.EMPTYNAME);
    if (userName.length < 1 && !errors.includes(ErrorCode.EMPTYNAME))
      errors.push(ErrorCode.NAMETOOSHORT);
    if (userName.length > 16)
      errors.push(ErrorCode.NAMETOOLONG);
    if (!questionAns)
      errors.push(ErrorCode.EMPTYANS);
    if (/^[a-zA-Z0-9_-]+$/.test(userName) === false)
      errors.push(ErrorCode.NAMEINVALID);
    return (errors);
  }

  async function handleSubmit() {

    let errors: ErrorCode[] = checkNameAndAnswer();
    let formData = new FormData();
    let avatarFile;

    if (TFAVerified === false && isTFAEnabled === true) {
      if (isVerifyingTFA === false) {
        setIsVerifyingTFA(true);
        return;
      }

      if (isVerifyingTFA) {
        errors.push(ErrorCode.TFANOTVERIFIED);
      }
    }

    sessionStorage.removeItem(`image-${userData.avatar}`)
    if (errors.length === 0) {
      avatarFile = dataURItoFile(avatar, `${userData.intraName}`);
      formData.append("userName", userName);
      formData.append("image", avatarFile);
      try {
        Api.updateToken("otp", tfaCode);
        await Api.patch("/user", formData);
      } catch (Error: any) {
        const error = (Error.response.data as ErrorData);
        if (error && error.error === "Invalid username - username already exists or invalid") {
          return setPopups([<ErrorPopup key={error.error} text={getError(ErrorCode.NAMETAKEN)} />]);
        }
      }
      setPopups([]);
      await sleep(1000);
      return login();
    }
    setPopups(errors.map((error) => <ErrorPopup key={error} text={getError(error)} />))
  }
}

export default UserForm