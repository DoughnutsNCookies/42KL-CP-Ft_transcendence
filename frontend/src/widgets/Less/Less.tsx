import React, { useEffect, useRef, useState } from 'react'
import LessFileIndicator from './LessFileIndicator';

interface LessProps {
  dataLength: number;
  lines: JSX.Element[];
  content: React.ReactNode | React.ReactNode[];
  fileString: string;
  setSearchTerm: (searchTerm: string) => void;
  startingIndex: number;
  setStartingIndex: (startingIndex: number) => void;
  endingIndex: number;
  setEndingIndex: (endingIndex: number) => void;
  onQuit: () => void;
}

function Less(props: LessProps) {

  // Props
  const {
    dataLength,
    lines,
    fileString,
    content,
    setSearchTerm,
    startingIndex,
    setStartingIndex,
    endingIndex,
    setEndingIndex,
    onQuit,
  } = props;

  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [maxDisplayLines, setMaxDisplayLines] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

    // this should run when the component is mounted
  useEffect(() => {
    handleResize();
    focusOnInput();
    observerSetup();
  }, []);

  useEffect(() => {
    if (inputValue === "")
      setIsSearching(false);
  }, [inputValue]);

  // calibrate the value of start and ending index
  useEffect(() => {
    if (maxDisplayLines > lines.length) {
      setEndingIndex(lines.length);
      setStartingIndex(0);
    }
    else
      setEndingIndex(startingIndex + maxDisplayLines - 1);
  }, [startingIndex])

  return (
    <div className='w-full h-full flex flex-col overflow-hidden text-base uppercase bg-dimshadow px-[2ch] relative' onClick={focusOnInput}>
      <input
        className='absolute w-0 h-0'
        onKeyDown={handleKeyDown}
        onChange={handleInput}
        value={inputValue}
        ref={inputRef}
      />
      <div className='flex flex-col w-full h-full overflow-hidden' ref={divRef}>
        {content}
      </div>
      <div className={`absolute bottom-0 left-0 flex flex-row ${dataLength === 0 ? '' : 'whitespace-pre'} lowercase bg-highlight px-[1ch]`}>
        {
          (!isSearching || inputValue === "")
            ? <><LessFileIndicator fileString={fileString+" "}/> {dataLength === 0 ? '' : `line [${startingIndex + 1}-${endingIndex}]/${lines.length}`} press 'q' to quit</>
            : inputValue
        }
      </div>
    </div>
  )

  // less: focus on the hidden input field
  function focusOnInput() {
    inputRef.current?.focus();
  }

  // less: handle resize
  function handleResize() {
    if (divRef.current) {
      const height = divRef.current.clientHeight;
      const lineHeight = 24;
      const max = Math.floor(height / lineHeight);
      setMaxDisplayLines(max);
      (max - 1 < lines.length) ? setEndingIndex(max - 1) : setEndingIndex(lines.length);
    }
  }

  // less: observer div's changes
  function observerSetup() {
    const divElement = divRef.current as Element;
    const observer = new ResizeObserver(handleResize);

    if (divElement) {
      observer.observe(divElement);
    }
    return () => observer.unobserve(divElement);
  }

  // less: handle input
  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    let value = e.currentTarget.value;

    if (value[value.length - 1] == '\\') value += '\\';

    setInputValue(value.toLowerCase());
    if (value[0] === '/') {
      setIsSearching(true);
      return;
    }
    setInputValue("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = event;
    const isLastLine = (startingIndex + maxDisplayLines > lines.length);
    const isFirstLine = startingIndex <= 0;

    // Backward one line
    if (key === "ArrowUp") {
      if (!isFirstLine) setStartingIndex(startingIndex - 1);
      return;
    }

    // Forward one line
    if (key === "ArrowDown") {
      if (!isLastLine) setStartingIndex(startingIndex + 1);
      return;
    }

    // Forward one line or Start searching
    if (key === "Enter") {
      if (inputValue === "" && !isLastLine) {
        setStartingIndex(startingIndex + 1);
      } else {
        setSearchTerm(inputValue.substring(1));
      }
      setInputValue("");
      return;
    }

    // Quit friendlist
    if (key === "q" && !isSearching) {
      setTimeout(() => onQuit(), 10);
      return;
    }
  }
}

export default Less