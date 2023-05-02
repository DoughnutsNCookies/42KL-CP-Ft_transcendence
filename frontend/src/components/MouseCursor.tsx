import React, { Ref, forwardRef, useCallback, useDeferredValue, useEffect, useImperativeHandle, useState } from 'react'
import sleep from '../functions/sleep';
import { debounce } from 'lodash';
import { Offset } from '../modal/GameModels';


interface Size {
  width: number
  height: number
}

enum CursorType {
  Default = 'absolute w-5 h-5 border-highlight rounded-full border-2',
  Button = 'pointer',
  HDrag = 'ew-resize',
  VDrag = 'ns-resize',
  Drag = 'move',
  Text = 'text',
  hover = 'hover',
}

interface CursorSizes {
  size1Default: Size
  size2Default: Size
  size3Default: Size
  size4Default: Size
}

const defaultCurser: CursorSizes = {
  size1Default: { width: 30, height: 30 },
  size2Default: { width: 18, height: 18 },
  size3Default: { width: 16, height: 16 },
  size4Default: { width: 6, height: 6 },
};
const hDCursor: CursorSizes = {
  size1Default: { width: 30, height: 30 },
  size2Default: { width: 18, height: 18 },
  size3Default: { width: 50, height: 16 },
  size4Default: { width: 6, height: 6 },
};
const vDCursor: CursorSizes = {
  size1Default: { width: 30, height: 30 },
  size2Default: { width: 18, height: 18 },
  size3Default: { width: 16, height: 50 },
  size4Default: { width: 6, height: 6 },
};
const dCursor: CursorSizes = {
  size1Default: { width: 30, height: 30 },
  size2Default: { width: 50, height: 18 },
  size3Default: { width: 16, height: 50 },
  size4Default: { width: 6, height: 6 },
};
const textCursor: CursorSizes = {
  size1Default: { width: 8, height: 40 },
  size2Default: { width: 5, height: 25 },
  size3Default: { width: 4, height: 20 },
  size4Default: { width: 2, height: 10 },
};



let timerId: NodeJS.Timeout | null = null;
let intervalId: NodeJS.Timeout | null = null;
let currentCursorType: CursorType = CursorType.Default;

const longPressDuration: number = 200;
let longPressDetected: boolean = false;

let offset1: Offset = { x: -100, y: -100 };
let offset2: Offset = { x: -100, y: -100 };
let offset3: Offset = { x: -100, y: -100 };
let offset4: Offset = { x: -100, y: -100 };
let animated: boolean = true;

interface MousePosition {
  offset1: Offset;
  offset2: Offset;
  offset3: Offset;
  offset4: Offset;
}
let frameCounter: number = 0;

const setDelayPosition = debounce(async (offset: Offset) => {
  await sleep(10);
  offset2 = offset;
  await sleep(10);
  offset3 = offset;
  await sleep(10);
  offset4 = offset;
}, 1)

function MouseCursor(props: any, ref: Ref<any>) {
  const { size1Default, size2Default, size3Default, size4Default } = defaultCurser;
  const [mousePosition, setMousePosition] = useState<MousePosition>({} as MousePosition);
  const [size1, setSize1] = useState<Size>(size1Default);
  const [size2, setSize2] = useState<Size>(size2Default);
  const [size3, setSize3] = useState<Size>(size3Default);
  const [size4, setSize4] = useState<Size>(size4Default);


  useEffect(() => {

    const animate = () => {
      if (animated) {
        // console.log('animate', frameCounter);
        if (frameCounter++ % 1 == 0)
          setMousePosition({
            offset1: offset1,
            offset2: offset2,
            offset3: offset3,
            offset4: offset4,
          });
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  // const divRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    handleHoverStart: handleHoverStart,
    handleHoverEnd: handleHoverEnd,
    handleHover: handleHover,
  }));

  useEffect(() => {
    window.onmousedown = handleMouseDown;
    window.onmouseup = handleMouseUp;
    window.ontouchstart = handleTouchStart;
    window.ontouchend = handleTouchEnd;
    window.onmousemove = (e) => onMouseMove(e);
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    }
  }, []);

  return (
    <>
      <div className={`absolute pointer-events-none border-highlight border-4 z-50 ${currentCursorType == CursorType.hover ? " " : "transform -translate-x-1/2 -translate-y-1/2 "} `}
        style={{
          left: offset1.x, top: offset1.y, width: size1.width, height: size1.height,
          borderRadius: currentCursorType == CursorType.hover ? '10px' : '50%',
          mixBlendMode: 'difference'
        }}
      />
      <div className='absolute pointer-events-none border-highlight rounded-full border-2 z-50 transform -translate-x-1/2 -translate-y-1/2 opacity-60 '
        style={{
          left: offset2.x, top: offset2.y, width: size2.width, height: size2.height,
          mixBlendMode: 'difference'
        }}
      />
      <div className='absolute pointer-events-none border-highlight rounded-full border-2 z-50 transform -translate-x-1/2 -translate-y-1/2 opacity-60 '
        style={{
          left: offset3.x, top: offset3.y, width: size3.width, height: size3.height,
          mixBlendMode: 'difference'
        }}
      />
      <div className='absolute pointer-events-none bg-highlight rounded-full transform  z-50 -translate-x-1/2 -translate-y-1/2 '
        style={{
          left: offset4.x, top: offset4.y, width: size4.width, height: size4.height,
          mixBlendMode: 'difference'
        }}
      />
    </>
  );

  function onMouseMove(e: MouseEvent) {
    const { clientX, clientY } = e;
    const offset: Offset = { x: clientX, y: clientY };

    // Update offset1 without delay
    if (currentCursorType !== CursorType.hover) {
      offset1 = offset;
    }
    // setDelayPosition(offset);
  }

  async function shortPressAnimation() {
    let i: number = 0;
    while (i < 15) {
      if (currentCursorType != CursorType.hover)
        setSize1({ width: size1Default.width + i * 3, height: size1Default.height + i * 3 });
      if (i > 2) setSize2({ width: size2Default.width + i * 2, height: size2Default.height + i * 2 });
      if (i > 4) setSize3({ width: size3Default.width + i, height: size3Default.height + i });
      if (i > 8) setSize4({ width: size4Default.width + i, height: size4Default.height + i });
      await sleep(5);
      i++;
    }
    await sleep(20);
    while (i >= 0) {
      if (currentCursorType != CursorType.hover)
        setSize1({ width: size1Default.width + i * 3, height: size1Default.height + i * 3 });
      setSize2({ width: size2Default.width + i * 2, height: size2Default.height + i * 2 });
      setSize3({ width: size3Default.width + i, height: size3Default.height + i });
      setSize4({ width: size4Default.width + i, height: size4Default.height + i });
      await sleep(5);
      i--;
    }
  }

  function handleHoverStart(e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>, cursorType: CursorType) {
    currentCursorType = cursorType;
    const rect = ref.current?.getBoundingClientRect();
    const { width, height, top, left } = rect || { width: 0, height: 0 };
    setSize1({ width: width + 10, height: height + 10 });
    const leftOffset = (e.clientX - left! - width / 2) / 4;
    const topOffset = (e.clientY - top! - height / 2) / 4;
    offset1 = { x: left! + leftOffset - 9, y: top! + topOffset - 9 };
  }

  function handleHover(e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>,) {
    const rect = ref.current?.getBoundingClientRect();
    const { width, height, top, left } = rect || { width: 0, height: 0 };
    setSize1({ width: width + 10, height: height + 10 });
    const leftOffset = (e.clientX - left! - width / 2) / 4;
    const topOffset = (e.clientY - top! - height / 2) / 4;
    offset1 = { x: left! + leftOffset - 9, y: top! + topOffset - 9 };
  }

  function handleHoverEnd() {
    currentCursorType = CursorType.Default;
    setSize1(size1Default);
  }

  function shortPress() {
    shortPressAnimation();
  }

  function longPressEndAnimation() {
    shortPressAnimation();
  }

  function longPress() {
    intervalId = setInterval(async () => {
      const num1 = Math.floor(Math.random() * 20);
      const num2 = Math.floor(Math.random() * 20);
      setSize2({ width: 6 + num1, height: 6 + num1 });
      setSize3({ width: 6 + num2, height: 6 + num2 });
    }, 40);
  }

  function longPressRealeased() {
    if (intervalId) clearInterval(intervalId);
    setSize2({ width: size2Default.width, height: size2Default.height });
    setSize3({ width: size3Default.width, height: size3Default.height });
    longPressEndAnimation();
  }

  function handleMouseDown() {
    longPressDetected = false;
    timerId = setTimeout(() => {
      longPress();
      longPressDetected = true;
    }, longPressDuration);
  }

  function handleMouseUp() {
    if (timerId) clearTimeout(timerId);
    if (!longPressDetected) shortPress();
    else longPressRealeased();
    longPressDetected = false;
  }

  function handleTouchStart() {
    longPressDetected = false;
    timerId = setTimeout(() => {
      longPress();
      longPressDetected = true;
    }, longPressDuration);
  }

  function handleTouchEnd() {
    if (timerId) clearTimeout(timerId!);
    if (!longPressDetected) shortPress();
    else longPressRealeased();
    longPressDetected = false;
  }
}


export default forwardRef(MouseCursor)