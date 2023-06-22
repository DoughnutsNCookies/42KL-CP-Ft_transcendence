import React from 'react'


interface TriangleProps {
  w?: number
  h?: number
  direction?: 'top' | 'right' | 'bottom' | 'left'
  color?: 'fill-dimshadow' | 'fill-highlight'
}

const Triangle = ({ w = 20, h = 20, direction = 'top', color = 'fill-highlight' }: TriangleProps) => {
  const points = {
    top: [`${w / 2},0`, `0,${h}`, `${w},${h}`],
    right: [`0,0`, `0,${h}`, `${w},${h / 2}`],
    bottom: [`0,0`, `${w},0`, `${w / 2},${h}`],
    left: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
  }

  return (
    <svg width={w} height={h}>
      <polygon points={points[direction].join(' ')} className={color + ' transition-all duration-300 ease-in-out'} />
      Sorry, your browser does not support inline SVG.
    </svg>
  )
}

export default Triangle