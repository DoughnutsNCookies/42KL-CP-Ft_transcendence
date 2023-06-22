import React from 'react'

interface ChatSearchbarProps {
  invert: boolean;
  setFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
}

function ChatSearchBar(props: ChatSearchbarProps) {

  const { invert = false, setFilterKeyword } = props;
  const [inputValue, setInputValue] = React.useState("");

  let style = (invert)
    ? `placeholder:text-dimshadow/20 bg-highlight text-dimshadow`
    : `placeholder:text-highlight/20 bg-dimshadow text-highlight`;

  return (
    <input
      className={`${style} px-2 py-1.5 font-bold rounded outline-none text-sm  cursor-text`}
      type='text'
      value={inputValue}
      onChange={handleOnChange}
      autoComplete='off'
      placeholder='search...'
      onClick={e => e.stopPropagation()}
    />
  )

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setFilterKeyword(e.target.value);
  }
}

export default ChatSearchBar