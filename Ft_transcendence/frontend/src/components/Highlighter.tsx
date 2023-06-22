import React from 'react'

interface HighlighterProps {
  text: string;
  searchTerm: string | undefined;
  style?: string;
}

function Highlighter(props: HighlighterProps) {

  const { text, searchTerm, style = `text-dimshadow bg-highlight` } = props;

  if (searchTerm === undefined) return <>{text}</>;

  const regex = new RegExp(searchTerm, 'gi');
  const matches = text.match(regex) || [];
  const splitText = text.split(regex);

  return (
    <>
      {splitText.map((word, i) => (
        <span key={i}>
          {word}
          {i < matches.length && <span className={style} key={text+`_`+i}>{matches[i]}</span>}
        </span>
      ))}
    </>
  );
}

export default Highlighter