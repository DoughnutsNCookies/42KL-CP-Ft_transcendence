import React, { useEffect, useRef } from 'react'
import PromptField, { CommandOptionData } from '../components/PromptField'
import ScrollView from '../components/ScrollView'
import Card from '../components/Card'
import login from '../api/loginAPI'
import rickroll from '../functions/rickroll'
import Pong from './Pong'
import sleep from '../functions/sleep'
import Clock from '../widgets/Clock'
import Game from '../game/Game'
import Queue from '../widgets/Queue'

interface TerminalProps {
  availableCommands: CommandOptionData[];
  handleCommands: (command: string[]) => void;
  elements: JSX.Element[];
  queueType: string;
  queueExpanded: boolean;
}

function Terminal(pros: TerminalProps) {
  const { availableCommands, handleCommands, elements, queueType, queueExpanded } = pros;
  const [mounted, setMounted] = React.useState(false);

  const promptFieldRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    promptFieldRef.current?.focusOnInput();
  }, []);

  return (
    <div className='relative flex flex-col justify-end flex-1 h-full'
      onClick={() => promptFieldRef.current?.focusOnInput()}
    >
      <ScrollView reverse={true}>
        {elements}
      </ScrollView>
      <div className={`h-1 w-full bg-highlight transition-transform duration-500 ${mounted ? " translate-x-0" : " -translate-x-full"}`} />
      <PromptField
        handleCommands={handleCommands}
        availableCommands={availableCommands}
        center={false} ref={promptFieldRef}
        enableHistory showtip
      />
      <Queue queueType={queueType} expanded={queueExpanded} />
      <div className={`absolute top-0 right-0 transition-transform duration-500 ${mounted ? " translate-x-0" : " translate-x-full"}`}>
        <Clock />
      </div>
    </div>
  )

}

export default Terminal