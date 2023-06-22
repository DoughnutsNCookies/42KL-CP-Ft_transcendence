import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { PolkaDotContainer } from "./components/Background";
// import Login from "./pages/Login";
import login, { checkAuth } from "./api/loginAPI";
// import HomePage from "./pages/HomePage";
// import UserForm from "./pages/UserForm/UserForm";
import { getMyProfile } from "./api/profileAPI";
import { UserData } from "./model/UserData";
import UserForm from "./pages/UserForm/UserForm";

const HomePage = lazy(() => import('./pages/HomePage'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  const [logged, setLogged] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [userData, setUserData] = useState<UserData>({} as UserData);
  const [updateUser, setUpdateUser] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    checkIfLoggedIn();
  }, []);

  let page = <></>;
  if ((newUser || updateUser)) {
    page = <UserForm userData={userData} isUpdatingUser={updateUser} setIsUpdatingUser={setUpdateUser} />;
  }
  else if (logged) {
    page = <HomePage setUserData={setUserData} setUpdateUser={setUpdateUser} userData={userData} />;
  } else if (loaded) {
    page = <Login />;
  }

  return (
    <PolkaDotContainer>
      <Suspense fallback={<Loading />}>
        {page}
      </Suspense>
    </PolkaDotContainer>
  )

  async function checkIfLoggedIn() {
    const getProfileRes = await getMyProfile().catch((err) => { });
    if (getProfileRes != null && (getProfileRes.data as UserData).accessToken) {
      setUserData(getProfileRes.data as UserData);
      setLogged(true);
      return;
    }

    const queryString: string = window.location.search;
    const urlParams: URLSearchParams = new URLSearchParams(queryString);
    let code: { code: string | null } = { code: urlParams.get('code') };

    if (code.code) {
      const res = await checkAuth(code.code);
      if (res) {
        if ((res as any).data.accessToken) {
          document.cookie = `Authorization=${(res as any).data.accessToken};`;
        }
        if ((res as any).data.newUser) {
          setUserData((await getMyProfile()).data as UserData);
          setNewUser(true);
        } else {
          login();
        }
        return;
      }
    }
    setLoaded(true);
  }
}

export default App


function Loading() {
  const [expended, setExpended] = useState(false);
  const [skewed, setSkewed] = useState(false);
  const [index, setIndex] = useState(0);
  const tickRef = useRef(10);

  useEffect(() => {
    setExpended(true);
    setTimeout(() => {
      setSkewed(true);
    }, 500);
  }, []);

  useEffect(() => {
    if (skewed) {
      const interval = setInterval(() => {
        tickRef.current++;
        if (tickRef.current === 26) tickRef.current = 1;
        setIndex(tickRef.current);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [skewed]);
  return (
    <div className="relative h-full w-full">
      <div className=' absolute right-20 bottom-20 flex flex-row h-fit items-center'>
        <h1 className=" text-highlight font-bungee mr-4 text-lg ">PONGsh</h1>
        <div className={`${expended ? (index === 1 || index === 25 ? "h-5" : "h-7") : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-1"} ease-out transition-all duration-500 bg-accRed w-3 mr-1 `} />
        <div className={`${expended ? (index === 2 || index === 1 ? "h-5" : "h-7") : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-1"} ease-out transition-all duration-500 bg-accCyan w-3 mr-1 `} />
        <div className={`${expended ? (index === 3 || index === 2 ? "h-5" : "h-7") : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-1"} ease-out transition-all duration-500 bg-accYellow w-3 mr-1 `} />
        <div className={`${expended ? (index === 4 || index === 3 ? "h-5" : "h-7") : "h-0"} ${skewed ? "-skew-x-[18deg]" : " -translate-x-1"} ease-out transition-all duration-500 bg-accBlue w-3 mr-1 `} />
      </div>
    </div>
  )
}