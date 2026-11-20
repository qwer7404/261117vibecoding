import type { DotSize } from '../types';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export const DOT_GRID_SIZE: Record<DotSize, number> = {
  small: 48,
  medium: 32,
  large: 22
};

export function validateAvatarFile(file: { type: string; name: string; size: number }): string | null {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  const lower = file.name.toLowerCase();
  const hasValidExt = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp');
  if (!allowed.includes(file.type) && !hasValidExt) {
    return 'PNG, JPG, WebP 이미지 파일만 업로드할 수 있습니다.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return '파일 크기는 5MB 이하여야 합니다.';
  }
  return null;
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };
    img.src = objectUrl;
  });
}

/**
 * 모서리 4곳에서 시작하는 Flood-Fill로 단색(흰색/단순 배경)만 투명화
 */
function stripCornerBackground(imageData: ImageData, tolerance = 38): void {
  const { width, height, data } = imageData;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const seeds = [
    0,
    width - 1,
    (height - 1) * width,
    height * width - 1
  ];

  // 기준 배경색은 좌상단 픽셀 RGB
  const baseR = data[0];
  const baseG = data[1];
  const baseB = data[2];

  const isSimilarToBg = (idx: number): boolean => {
    const offset = idx * 4;
    if (data[offset + 3] < 20) return true;
    const dr = Math.abs(data[offset] - baseR);
    const dg = Math.abs(data[offset + 1] - baseG);
    const db = Math.abs(data[offset + 2] - baseB);
    return dr <= tolerance && dg <= tolerance && db <= tolerance;
  };

  for (const s of seeds) {
    if (s >= 0 && s < width * height && !visited[s] && isSimilarToBg(s)) {
      visited[s] = 1;
      queue.push(s);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    data[curr * 4 + 3] = 0; // 투명 처리

    const x = curr % width;
    const y = Math.floor(curr / width);

    const neighbors = [
      x > 0 ? curr - 1 : -1,
      x < width - 1 ? curr + 1 : -1,
      y > 0 ? curr - width : -1,
      y < height - 1 ? curr + width : -1
    ];

    for (const next of neighbors) {
      if (next >= 0 && !visited[next] && isSimilarToBg(next)) {
        visited[next] = 1;
        queue.push(next);
      }
    }
  }
}

export async function pixelateProfileBlob(
  blob: Blob,
  dotSize: DotSize,
  removeBg: boolean
): Promise<string> {
  const img = await loadImageFromBlob(blob);
  const grid = DOT_GRID_SIZE[dotSize];

  const aspect = img.width / Math.max(1, img.height);
  const drawW = aspect >= 1 ? grid : Math.max(1, Math.round(grid * aspect));
  const drawH = aspect >= 1 ? Math.max(1, Math.round(grid / aspect)) : grid;
  const offsetX = Math.floor((grid - drawW) / 2);
  const offsetY = Math.floor((grid - drawH) / 2);

  const tinyCanvas = document.createElement('canvas');
  tinyCanvas.width = grid;
  tinyCanvas.height = grid;
  const tinyCtx = tinyCanvas.getContext('2d');
  if (!tinyCtx) {
    throw new Error('Canvas 2D 초기화 실패');
  }
  tinyCtx.imageSmoothingEnabled = false;
  tinyCtx.clearRect(0, 0, grid, grid);
  tinyCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

  if (removeBg) {
    const imgData = tinyCtx.getImageData(0, 0, grid, grid);
    stripCornerBackground(imgData);
    tinyCtx.putImageData(imgData, 0, 0);
  }

  const outputSize = 192;
  const outCanvas = document.createElement('canvas');
  outCanvas.width = outputSize;
  outCanvas.height = outputSize;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) {
    throw new Error('출력 Canvas 초기화 실패');
  }
  outCtx.imageSmoothingEnabled = false;
  outCtx.clearRect(0, 0, outputSize, outputSize);
  outCtx.drawImage(tinyCanvas, 0, 0, outputSize, outputSize);

  return outCanvas.toDataURL('image/png');
}
