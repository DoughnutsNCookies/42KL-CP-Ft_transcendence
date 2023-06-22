import React, { useEffect } from 'react'

interface ContainerProps {
  children: JSX.Element | JSX.Element[];
};

export function PolkaDotContainer(props: ContainerProps) {
  const [mouted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className={`polka-dot transition-all duration-700 overflow-hidden ${mouted ? "rounded-3xl border-[4px]" : ""}`}>
      {props.children}
    </div>
  )
}
