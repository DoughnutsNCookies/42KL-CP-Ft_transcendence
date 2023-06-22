import React from 'react'
import Card, { CardType } from '../../components/Card'
import CommandOption from './CommandOption'

interface HelpCardProps {
  title: string,
  usage: string,
  option: string,
  commandOptions: Array<Map<string, string>>;
}

function HelpCard(props: HelpCardProps) {

  const { title, usage, option, commandOptions } = props;

  return (
    <Card type={CardType.SUCCESS} key={Math.random().toString(36).slice(2) + Date.now().toString(36)}>
      <p className='text-xl uppercase font-bold'>{title}</p>
      {usage !== '' ? <p className='text-highlight/60 text-sm'>Usage: {usage}</p> : <></>}
      {usage !== '' ? <br /> : <div className="pb-"></div>}
      <p className='text-highlight text-md font-bold capitalize'>{option}:</p>
      {
        displayAllOptions()
      }
    </Card>
  )

  function getMaxLengthOfKey(allOptions: Array<Map<string, string>>): number {
    let max:number = 0;
    for (const option of allOptions) {
      for (const optionKey of option.keys()) {
        if (optionKey.length > max) max = optionKey.length;
      }
    }
    return max; 
  }

  function displayAllOptions() {
    const allOptions: JSX.Element[] = [];
    const maxKeyLength = getMaxLengthOfKey(commandOptions);
    let index: number = 0;
    for (const option of commandOptions) {
      allOptions.push(
        <CommandOption key={Math.random().toString(36).slice(2) + Date.now().toString(36)} options={option} spaces={maxKeyLength} />,
        <br key={"br"+index}/>
      )
      index++;
    }
    allOptions.pop();
    return allOptions;
  }
}

export default HelpCard