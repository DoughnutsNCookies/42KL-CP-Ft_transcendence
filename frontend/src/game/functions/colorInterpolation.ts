import { clamp, update } from "lodash";

interface ColorTweenProps {
  start: number;
  end: number;
}

class ColorTween {
  start: number[];
  end: number[];
  result: number[];
  t: number;
  done: boolean = false;
  constructor({ start, end }: ColorTweenProps) {
    this.start = [
      (start & 0xff0000) >> 16,
      (start & 0x00ff00) >> 8,
      start & 0x0000ff,
    ];
    this.end = [(end & 0xff0000) >> 16, (end & 0x00ff00) >> 8, end & 0x0000ff];
    this.result = [0, 0, 0];
    this.t = 0;
  }

  lerp(t: number) {
    for (let i = 0; i < 3; i++) {
      const c12 = this.start[i] * this.start[i];
      const c22 = this.end[i] * this.end[i];

      this.result[i] =
        Math.round(Math.sqrt(c12 + clamp(t * t, 0, 1) * (c22 - c12))) >> 0;
    }
    return (this.result[0] << 16) | (this.result[1] << 8) | this.result[2];
  }

  get colorLerp() {
    return this.lerp(this.t);
  }

  get colorSlerp() {
    return this.slerp(this.t);
  }

  update(delta: number) {
    this.t += delta;
    if (this.t > 1) {
      this.done = true;
    }
  }

  slerp(t: number) {
    return this.lerp((-Math.cos(t * Math.PI) + 1) / 2);
  }
}

export default ColorTween;
