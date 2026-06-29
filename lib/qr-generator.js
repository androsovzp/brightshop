import QRCode from 'qrcode';

/**
 * Generates a styled SVG string for a given text URL.
 * Matches organic, liquid, doodle QR code aesthetics.
 */
export function generateStyledSVG(text, options = {}) {
  const {
    darkColor = '#000000',
    lightColor = '#ffffff',
    errorCorrectionLevel = 'Q', // Higher error correction for stylized modules
    style = 'doodle' // 'doodle', 'rounded', 'classic'
  } = options;

  const qr = QRCode.create(text, { errorCorrectionLevel });
  const size = qr.modules.size;
  const cellSize = 10;
  const margin = 3 * cellSize;
  const totalSize = size * cellSize + margin * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">\n`;
  svg += `  <rect width="100%" height="100%" fill="${lightColor}"/>\n`;

  const isFinder = (r, c) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= size - 7) return true;
    if (r >= size - 7 && c < 7) return true;
    return false;
  };

  const isDark = (r, c) => {
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    return qr.modules.get(r, c) === 1;
  };

  // Render organic finder patterns
  const renderFinder = (startRow, startCol) => {
    const x = margin + startCol * cellSize;
    const y = margin + startRow * cellSize;
    const w7 = 7 * cellSize;
    const w5 = 5 * cellSize;
    const w3 = 3 * cellSize;

    const rxOuter = 2.4 * cellSize;
    const rxInner = 1.4 * cellSize;
    const rxCore = 1.1 * cellSize;

    // Compound outer frame
    svg += `  <path d="
      M ${x + rxOuter} ${y}
      h ${w7 - 2 * rxOuter}
      a ${rxOuter} ${rxOuter} 0 0 1 ${rxOuter} ${rxOuter}
      v ${w7 - 2 * rxOuter}
      a ${rxOuter} ${rxOuter} 0 0 1 -${rxOuter} ${rxOuter}
      h -${w7 - 2 * rxOuter}
      a ${rxOuter} ${rxOuter} 0 0 1 -${rxOuter} -${rxOuter}
      v -${w7 - 2 * rxOuter}
      a ${rxOuter} ${rxOuter} 0 0 1 ${rxOuter} -${rxOuter}
      z
      M ${x + cellSize + rxInner} ${y + cellSize}
      v ${w5 - 2 * rxInner}
      a ${rxInner} ${rxInner} 0 0 0 ${rxInner} ${rxInner}
      h ${w5 - 2 * rxInner}
      a ${rxInner} ${rxInner} 0 0 0 ${rxInner} -${rxInner}
      v -${w5 - 2 * rxInner}
      a ${rxInner} ${rxInner} 0 0 0 -${rxInner} -${rxInner}
      h -${w5 - 2 * rxInner}
      a ${rxInner} ${rxInner} 0 0 0 -${rxInner} ${rxInner}
      z
    " fill="${darkColor}" fill-rule="evenodd"/>\n`;

    // Center core dot
    svg += `  <rect x="${x + 2 * cellSize}" y="${y + 2 * cellSize}" width="${w3}" height="${w3}" rx="${rxCore}" ry="${rxCore}" fill="${darkColor}"/>\n`;
  };

  renderFinder(0, 0);
  renderFinder(0, size - 7);
  renderFinder(size - 7, 0);

  // Render body modules with smooth organic capsules & dots
  const visited = Array.from({ length: size }, () => Array(size).fill(false));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinder(r, c) || visited[r][c] || !isDark(r, c)) continue;

      // Find horizontal segment
      let hLen = 1;
      while (c + hLen < size && !isFinder(r, c + hLen) && isDark(r, c + hLen)) {
        if (isDark(r - 1, c + hLen) || isDark(r + 1, c + hLen)) break;
        hLen++;
      }

      // Find vertical segment
      let vLen = 1;
      while (r + vLen < size && !isFinder(r + vLen, c) && isDark(r + vLen, c)) {
        if (isDark(r + vLen, c - 1) || isDark(r + vLen, c + 1)) break;
        vLen++;
      }

      const x = margin + c * cellSize;
      const y = margin + r * cellSize;

      if (hLen > 1 && hLen >= vLen) {
        const w = hLen * cellSize;
        const rx = cellSize * 0.45;
        svg += `  <rect x="${x}" y="${y}" width="${w}" height="${cellSize}" rx="${rx}" ry="${rx}" fill="${darkColor}"/>\n`;
        for (let i = 0; i < hLen; i++) visited[r][c + i] = true;
      } else if (vLen > 1) {
        const h = vLen * cellSize;
        const rx = cellSize * 0.45;
        svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${h}" rx="${rx}" ry="${rx}" fill="${darkColor}"/>\n`;
        for (let i = 0; i < vLen; i++) visited[r + i][c] = true;
      } else {
        // Individual module - alternate between circle and rounded rect for doodle feel
        const isCircle = (r + c) % 3 === 0;
        if (isCircle) {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          const rad = cellSize * 0.44;
          svg += `  <circle cx="${cx}" cy="${cy}" r="${rad}" fill="${darkColor}"/>\n`;
        } else {
          const rx = cellSize * 0.42;
          svg += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${rx}" ry="${rx}" fill="${darkColor}"/>\n`;
        }
        visited[r][c] = true;
      }
    }
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Returns a Data URL (SVG format) for standard browser image src rendering
 */
export function generateStyledSVGDataUrl(text, options = {}) {
  const svg = generateStyledSVG(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Downloads high-res PNG generated from styled SVG client-side.
 */
export function downloadStyledQRPNG(text, filename = 'qr-brightshop.png', canvasSize = 1200) {
  if (typeof window === 'undefined') return;
  const svgString = generateStyledSVG(text);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
}
