import React from 'react'

interface ButtonProps {
  title: string;
  bgColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  textTransform?: string;
  flex?: string;
  padding?: string;
  onClick?: () => void;
}

function Button(props: ButtonProps) {
  const {
    title,
    bgColor,
    textColor,
    width,
    height,
    borderColor,
    borderRadius,
    borderWidth,
    textTransform,
    flex,
    padding,
    onClick } = props;

  return (
    <button
      className={
        `${textTransform} bg-${bgColor} text-${textColor} rounded-${borderRadius} border-${borderColor} border-${borderWidth} w-${width} h-${height} flex-${flex} p-${padding}`
      }
      type='button'
      onClick={onClick}
      >
      {title}
    </button>
  )
}

export default Button