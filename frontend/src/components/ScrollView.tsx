import React from 'react'

interface ScrollViewProps {
  children: React.ReactNode | React.ReactNode[];
  reverse?: boolean;
  className?: string;
}

function ScrollView(props: ScrollViewProps) {
  const { children, reverse, className } = props;
  return (
    <div className={reverse ? `overflow-y-auto scroll-m-0 scroll-p-0 scrollbar-hide flex-1 flex flex-col-reverse ${className}` : `overflow-y-auto scroll-m-0 scroll-p-0 scrollbar-hide flex-1 flex flex-col ${className}`}>
      {children}
    </div>
  )
}

export default ScrollView