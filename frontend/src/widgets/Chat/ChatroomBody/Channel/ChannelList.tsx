import React, { useContext, useEffect, useRef, useState } from 'react'
import ChatTableTitle from '../../ChatWidgets/ChatTableTitle'
import ChatNavbar from '../../ChatWidgets/ChatNavbar'
import Channel from './Channel'
import { ChatContext } from '../../../../contexts/ChatContext';
import ChatroomList from '../Chatroom/ChatroomList';
import { getAllPublicChannels } from '../../../../api/chatAPIs';
import { ChatroomData } from '../../../../model/ChatRoomData';
import { FaEye, FaFlushed, FaHandPaper, FaSadCry, FaTimes } from 'react-icons/fa';
import { ErrorPopup } from '../../../../components/Popup';

const CHANNEL_FETCH_LIMIT = 5;

enum FetchChannelType {
  ALL,
  FILTERED,
  FILTERED_SCROLL
}

function ChannelList() {

  const { setChatBody } = useContext(ChatContext);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [channelComponents, setChannelComponents] = useState<JSX.Element[]>([]);
  const [filteredChannelComponents, setFilteredChannelComponents] = useState<JSX.Element[]>([]);
  const [page, setPage] = useState<number>(1);
  const [filteredPage, setFilteredPage] = useState<number>(1);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const [canBeFetched, setCanBeFetched] = useState<boolean>(true);
  const [canBeFetchedFiltered, setCanBeFetchedFiltered] = useState<boolean>(true);
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const [listFiltered, setListFiltered] = useState<boolean>(false);
  const [hasErrorJoining, setHasErrorJoining] = useState<boolean>(false);
  const [joinChannelErrorMsg, setJoinChannelErrorMsg] = useState<string>('');

  useEffect(() => {
    getPublicChannels();

    const scrollableDiv = scrollableDivRef.current;
    scrollableDiv?.addEventListener('scroll', handleScrollToBottom);

    return () => {
      scrollableDiv?.removeEventListener('scroll', handleScrollToBottom);
    }
  }, []);

  useEffect(() => {
    if (hasErrorJoining) {
      setTimeout(() => {
        setHasErrorJoining(false);
        setJoinChannelErrorMsg('');
      }, 2000);
    }
  }, [hasErrorJoining]);

  useEffect(() => {
    let shouldListFiltered = false;
    if (filterKeyword === "") {
      shouldListFiltered = false;
    } else {
      setFilteredChannelComponents([]);
      setCanBeFetchedFiltered(true);
      setFilteredPage(1);
      shouldListFiltered = true;
    }
    getPublicChannels((shouldListFiltered ? FetchChannelType.FILTERED : FetchChannelType.ALL), 1);
    setListFiltered(shouldListFiltered);
  }, [filterKeyword]);

  useEffect(() => {
    if (isAtBottom) {
      getPublicChannels((listFiltered ? FetchChannelType.FILTERED_SCROLL : FetchChannelType.ALL), filteredPage);
    }
  }, [isAtBottom]);

  return (
    <div className='relative flex flex-col flex-1 h-0 border-box text-highlight'>
      <ChatNavbar title="channel list" backAction={() => setChatBody(<ChatroomList />)} />
      <div className='absolute right-0 z-30 top-4'>
        {hasErrorJoining && <ErrorPopup text={joinChannelErrorMsg} />}
      </div>
      <div className='relative w-full h-full px-10 overflow-y-scroll scrollbar-hide' ref={scrollableDivRef}>
        <div className='sticky top-0 z-10 bg-dimshadow'>
          <ChatTableTitle title={`channels`} searchable={true} setFilterKeyword={setFilterKeyword} />
        </div>
        <div className='w-full h-full'>
          {listFiltered ? filteredChannelComponents : channelComponents}
          {(listFiltered ? filteredChannelComponents : channelComponents).length === 0 && emptyChannelList()}
        </div>
      </div>
    </div>
  )

  async function handleScrollToBottom() {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableDiv;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isAtBottom);
    }
  }
  
  function emptyChannelList() {
    return (
      <div className='absolute flex flex-col items-center -translate-x-1/2 gap-y-2 w-fit -translate-y-1/3 top-1/3 left-1/2'>
        {
          filterKeyword !== ""
            ? <span className='w-full text-center'>Hmm... Maybe try another keyword?</span>
            : <span className='w-full text-center'>There's no channel for you to join right now...</span>
        }
        <FaSadCry className='text-xl'/>
      </div>
    )
  }

  async function getPublicChannels(channelType: FetchChannelType = FetchChannelType.ALL, pageNumber: number = 1) {
    
    if ((channelType === FetchChannelType.ALL && !canBeFetched) || (channelType === FetchChannelType.FILTERED_SCROLL && !canBeFetchedFiltered)) return;
    
    const channels = (await getAllPublicChannels(CHANNEL_FETCH_LIMIT, (channelType === FetchChannelType.ALL ? page : pageNumber), filterKeyword)).data as ChatroomData[];
    if (channels.length < CHANNEL_FETCH_LIMIT) {
      (channelType === FetchChannelType.ALL && setCanBeFetched(false));
      (channelType === FetchChannelType.FILTERED_SCROLL && setCanBeFetchedFiltered(false));
    }

    const newChannelComponents: JSX.Element[] = channels.map((channel) => {
      return <Channel key={channel.channelId} channelInfo={channel} setHasErrorJoining={setHasErrorJoining} setJoinChannelErrorMsg={setJoinChannelErrorMsg}/>
    });

    if (channelType === FetchChannelType.ALL) {
      setPage(page + 1);
      setChannelComponents([...channelComponents, ...newChannelComponents]);
    } else {
      setFilteredPage(pageNumber + 1);
      if (pageNumber === 1)
        setFilteredChannelComponents(newChannelComponents);
      else
        setFilteredChannelComponents([...filteredChannelComponents, ...newChannelComponents]);
    }
  }
}

export default ChannelList