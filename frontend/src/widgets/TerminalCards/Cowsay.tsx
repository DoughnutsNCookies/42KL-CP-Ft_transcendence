import React from 'react'
import Card, { CardType } from '../../components/Card';

interface CowsayProps {
  index: number;
  commands: string[];
}

function Cowsay(props: CowsayProps) {

  const { index, commands } = props;
  const cowsayString = commands.join(" ");

  return (
    <Card key={index} type={CardType.SUCCESS}>
      <p>{` _${new Array(cowsayString.length + 1).join("_")}_`}</p>
      <p>{`< ${cowsayString} >`}</p>
      <p>{` _${new Array(cowsayString.length + 1).join("_")}_`}</p>
      <p>{`        \\   ^__^`}</p>
      <p>{`         \\  (oo)\_______`}</p>
      <p>{`            (__)\       )\\/\\`}</p>
      <p>{`               ||----w |`}</p>
      <p>{`               ||     ||`}</p>
    </Card>
  )
}
  
export default Cowsay