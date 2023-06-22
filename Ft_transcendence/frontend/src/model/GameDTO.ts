import { HitType } from "../functions/audio";

export class GameDTO {
  ballPosX: number;
  ballPosY: number;
  ballVelX: number;
  ballVelY: number;
  leftPaddlePosY: number;
  rightPaddlePosY: number;
  player1Score: number;
  player2Score: number;
  spin: number;
  attracted: boolean;
  blockX: number | null;
  blockY: number | null;
  hitType: HitType;

  constructor(
    ballPosX: number,
    ballPosY: number,
    ballVelX: number,
    ballVelY: number,
    leftPaddlePosY: number,
    rightPaddlePosY: number,
    player1Score: number,
    player2Score: number,
    spin: number = 0,
    attracted: boolean = false,
    blockX: number | null = null,
    blockY: number | null = null,
    hitType: HitType
  ) {
    this.ballPosX = ballPosX;
    this.ballPosY = ballPosY;
    this.ballVelX = ballVelX;
    this.ballVelY = ballVelY;
    this.leftPaddlePosY = leftPaddlePosY;
    this.rightPaddlePosY = rightPaddlePosY;
    this.player1Score = player1Score;
    this.player2Score = player2Score;
    this.blockX = blockX;
    this.blockY = blockY;
    this.spin = spin;
    this.attracted = attracted;
    this.hitType = hitType;
  }
}
