export interface PixilationWorkerMessage {
  type: "PIXILATE";
  payload: PixilationWorkerData;
}

export interface PixilationWorkerData {
  imageData: string;
  pixelSize: number;
}

export interface DrawData {
  imageData: ImageData;
  w: number;
  h: number;
  pixelSize: number;
}
