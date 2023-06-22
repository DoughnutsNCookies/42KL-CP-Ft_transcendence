import React, { useEffect } from 'react'

interface CommandOptionProps {
  title?: string;
  options: Map<string, string>;
  spaces: number;
}

function CommandOption(props: CommandOptionProps) {

  const { options, spaces } = props;

  const generateOptions = () => {
    const optionElements: JSX.Element[] = [];
    for (const [key, value] of options) {
      let index = 0;
      optionElements.push(
        <div className='flex flex-row text-sm' key={key}>
          <p className='whitespace-pre'>{`${key}` + ' '.repeat(spaces - key.length)}: </p>
          <p className='text-highlight/70'>{value}</p>
        </div>
      )
    }
    return optionElements;
  };

  return (
    <div className="flex flex-col">
      {generateOptions()}
    </div>
  )
}

export default CommandOption