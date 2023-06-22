import { DrawData } from "../model/pixilationWorkerData";

function draw(data: DrawData) {
  const { imageData, w, h, pixelSize } = data;
  for (let y = 0; y < h; y += pixelSize) {
    for (let x = 0; x < w; x += pixelSize) {
      const pixelIndex = (y * w + x) * 4;
      const r = imageData.data[pixelIndex];
      const g = imageData.data[pixelIndex + 1];
      const b = imageData.data[pixelIndex + 2];
      for (let i = 0; i < pixelSize; i++) {
        for (let j = 0; j < pixelSize; j++) {
          const row = y + i;
          const col = x + j;
          const index = (row * w + col) * 4;
          imageData.data[index] = r;
          imageData.data[index + 1] = g;
          imageData.data[index + 2] = b;
        }
      }
    }
  }
  self.postMessage({
    type: "PIXILATE",
    payload: { imageData: imageData, w: w, h: h },
  });
}

self.onmessage = (e) => {
  if (e.data.type === "PIXILATE") {
    draw(e.data.payload);
  }
};
