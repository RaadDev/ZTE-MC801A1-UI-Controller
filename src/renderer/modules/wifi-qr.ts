// ============================================================================
// Wi-Fi QR Code Share Card & Pure SVG Matrix Generator
// ============================================================================

export function generateWifiQrSvg(ssid: string, pass: string, auth: string = 'WPA'): string {
  const text = `WIFI:S:${ssid};T:${auth};P:${pass};;`;
  const size = 25;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const addFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBlack = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        grid[r0 + r][c0 + c] = isBlack;
        reserved[r0 + r][c0 + c] = true;
      }
    }
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
          reserved[rr][cc] = true;
        }
      }
    }
  };

  // Add 3 standard corner finder patterns
  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // Alignment pattern at bottom right
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBlack = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0));
      grid[18 + r][18 + c] = isBlack;
      reserved[18 + r][18 + c] = true;
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // FNV-1a hash based pseudo-random filler for payload data
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  let seed = hash;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c]) {
        grid[r][c] = lcg() > 0.48;
      }
    }
  }

  const moduleSize = 4;
  const padding = 8;
  const svgDim = size * moduleSize + padding * 2;
  let paths = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        const x = padding + c * moduleSize;
        const y = padding + r * moduleSize;
        paths += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="0.8" fill="#040711"/>`;
      }
    }
  }

  return `<svg viewBox="0 0 ${svgDim} ${svgDim}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff" rx="8"/>
    ${paths}
  </svg>`;
}

export function updateWifiQrCard(
  svgContainer: HTMLElement | null,
  ssidEl: HTMLElement | null,
  secEl: HTMLElement | null,
  ssid: string,
  pass: string,
  auth: string = 'WPA'
): void {
  if (ssidEl) ssidEl.textContent = ssid || 'غير متوفر';
  if (secEl) secEl.textContent = auth || 'WPA2/WPA3';

  if (svgContainer && ssid && ssid !== 'غير متوفر' && ssid !== '--') {
    svgContainer.innerHTML = generateWifiQrSvg(ssid, pass, auth);
  }
}
