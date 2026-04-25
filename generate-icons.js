const { PNG } = require('pngjs');
const fs = require('fs');

const BG     = [244, 239, 230]; // #f4efe6
const FACE   = [250, 243, 224]; // #faf3e0
const BORDER = [139,  69,  19]; // #8b4513
const PIP    = [ 90,  45,  12]; // #5a2d0c

const PIP_POSITIONS = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

function sdfRoundedRect(px, py, x, y, w, h, r) {
  const dx = Math.max(Math.abs(px - (x + w / 2)) - w / 2 + r, 0);
  const dy = Math.max(Math.abs(py - (y + h / 2)) - h / 2 + r, 0);
  return Math.sqrt(dx * dx + dy * dy) - r;
}

function sdfCircle(px, py, cx, cy, r) {
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) - r;
}

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function blend(dst, src, a) {
  return Math.round(dst * (1 - a) + src * a);
}

function setPixel(data, width, x, y, r, g, b, a) {
  const idx = (y * width + x) * 4;
  const sa = a / 255;
  const da = data[idx + 3] / 255;
  const oa = sa + da * (1 - sa);
  if (oa < 0.001) return;
  data[idx]     = Math.round((r * sa + data[idx]     * da * (1 - sa)) / oa);
  data[idx + 1] = Math.round((g * sa + data[idx + 1] * da * (1 - sa)) / oa);
  data[idx + 2] = Math.round((b * sa + data[idx + 2] * da * (1 - sa)) / oa);
  data[idx + 3] = Math.round(oa * 255);
}

function drawDie(png, dieX, dieY, diceSize, face, angleDeg) {
  const cos = Math.cos((angleDeg * Math.PI) / 180);
  const sin = Math.sin((angleDeg * Math.PI) / 180);
  const cx = dieX + diceSize / 2;
  const cy = dieY + diceSize / 2;
  const border = diceSize * 0.055;
  const radius = diceSize * 0.14;
  const pipR = diceSize * 0.09;
  const AA = 1.2;

  const pips = PIP_POSITIONS[face].map(([px, py]) => [px * diceSize, py * diceSize]);
  const halfDiag = diceSize * 0.78;
  const minX = Math.max(0, Math.floor(cx - halfDiag));
  const maxX = Math.min(png.width - 1, Math.ceil(cx + halfDiag));
  const minY = Math.max(0, Math.floor(cy - halfDiag));
  const maxY = Math.min(png.height - 1, Math.ceil(cy + halfDiag));

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const dx = px - cx;
      const dy = py - cy;
      const lx = cos * dx + sin * dy + diceSize / 2;
      const ly = -sin * dx + cos * dy + diceSize / 2;

      const outerD = sdfRoundedRect(lx, ly, 0, 0, diceSize, diceSize, radius);
      if (outerD > AA) continue;

      const innerD = sdfRoundedRect(lx, ly, border, border, diceSize - 2 * border, diceSize - 2 * border, Math.max(1, radius - border));

      let minPipD = Infinity;
      for (const [ppx, ppy] of pips) {
        minPipD = Math.min(minPipD, sdfCircle(lx, ly, ppx, ppy, pipR));
      }

      let r, g, b, a = 255;

      if (outerD >= 0) {
        // Outer anti-aliased edge
        const alpha = 1 - smoothstep(0, AA, outerD);
        if (alpha < 0.01) continue;
        [r, g, b] = BORDER;
        a = Math.round(alpha * 255);
      } else if (innerD >= 0) {
        // Border region, with inner edge AA
        const faceAlpha = 1 - smoothstep(-AA, 0, innerD);
        [r, g, b] = [
          blend(BORDER[0], FACE[0], faceAlpha),
          blend(BORDER[1], FACE[1], faceAlpha),
          blend(BORDER[2], FACE[2], faceAlpha),
        ];
      } else if (minPipD < AA) {
        // Pip (with AA)
        const pipAlpha = 1 - smoothstep(-AA, 0, minPipD);
        [r, g, b] = [
          blend(FACE[0], PIP[0], pipAlpha),
          blend(FACE[1], PIP[1], pipAlpha),
          blend(FACE[2], PIP[2], pipAlpha),
        ];
      } else {
        [r, g, b] = FACE;
      }

      setPixel(png.data, png.width, px, py, r, g, b, a);
    }
  }
}

function createCanvas(size, transparent = false) {
  const png = new PNG({ width: size, height: size, filterType: -1 });
  for (let i = 0; i < size * size; i++) {
    const idx = i * 4;
    if (transparent) {
      png.data[idx] = png.data[idx + 1] = png.data[idx + 2] = png.data[idx + 3] = 0;
    } else {
      png.data[idx] = BG[0]; png.data[idx + 1] = BG[1]; png.data[idx + 2] = BG[2]; png.data[idx + 3] = 255;
    }
  }
  return png;
}

function renderDice(png, scale = 0.35) {
  const { width: size } = png;
  const diceSize = size * scale;
  const gap = size * 0.06;
  const startX = (size - diceSize * 2 - gap) / 2;
  const startY = (size - diceSize) / 2;
  drawDie(png, startX, startY, diceSize, 5, -10);
  drawDie(png, startX + diceSize + gap, startY, diceSize, 5, 10);
}

function downsample(src, newSize) {
  const dst = new PNG({ width: newSize, height: newSize, filterType: -1 });
  const scale = src.width / newSize;
  for (let y = 0; y < newSize; y++) {
    for (let x = 0; x < newSize; x++) {
      const sx = Math.min(Math.round(x * scale), src.width - 1);
      const sy = Math.min(Math.round(y * scale), src.height - 1);
      const si = (sy * src.width + sx) * 4;
      const di = (y * newSize + x) * 4;
      dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = src.data[si + 3];
    }
  }
  return dst;
}

function save(png, filePath) {
  fs.writeFileSync(filePath, PNG.sync.write(png));
  console.log(`✓ ${filePath} (${png.width}×${png.height})`);
}

console.log('Generating icons...\n');

// icon.png — 1024×1024, cream background (iOS + fallback)
const icon = createCanvas(1024);
renderDice(icon);
save(icon, 'assets/icon.png');

// adaptive-icon.png — transparent background (Android foreground layer)
const adaptive = createCanvas(1024, true);
renderDice(adaptive, 0.30); // slightly smaller for Android safe zone
save(adaptive, 'assets/adaptive-icon.png');

// splash-icon.png — same as icon
save(icon, 'assets/splash-icon.png');

// favicon.png — 48×48 downsampled from icon
const favicon = downsample(icon, 48);
save(favicon, 'assets/favicon.png');

console.log('\nDone! Run "npx expo prebuild --clean" to apply icons.');
