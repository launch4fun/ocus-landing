/**
 * OCUS HERO ANIMATED ASCII ENGINE
 * -----------------------------------------------------------------------------
 * 24.0-second 4-phase animation loop:
 *   0.0s -  9.8s : Phase 1 - Rotating 3D monochrome Earth tilted toward North Pole with orbital belt
 *   9.8s - 13.8s : Phase 2 - Smooth quintic morph into round pupil; orbital belt unwraps into Ocus eye
 *  13.8s - 19.2s : Phase 3 - Ocus eye scans left-down with organic outer lashes & eyelid flex
 *  19.2s - 24.0s : Phase 4 - Reverse morph back to rotating illuminated Earth
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroAsciiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });

  const PALETTE = {
    bg: '#F7F5EE',           // Exact Ocus canvas background color
    inkDeep: '#161618',      // Primary dense charcoal/black ASCII ink
    inkDark: '#27272A',      // Secondary dense ink for shading
    inkMid: '#48484F',       // Medium structural shading
    inkSoft: '#7A7982',      // Soft volumetric shadow
    inkFaint: '#B6B3AA',     // Subtle ocean limb & orbital ring back-arc
    inkWhisper: '#D8D4CA'    // Atmospheric dither / outer shadow halo
  };

  const COLS = 136;
  const ROWS = 72;
  const CHAR_ASPECT = 0.56;
  const BASE_GLOBE_RADIUS = 19.5;
  const PUPIL_RADIUS = 8.6;

  const grid = new Array(ROWS);
  for (let r = 0; r < ROWS; r++) {
    grid[r] = new Array(COLS);
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = { char: ' ', color: PALETTE.inkDeep, weight: 400, prio: 0 };
    }
  }

  let cellW = 10;
  let cellH = 18;
  let fontSize = 15;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const container = canvas.parentElement;
    const cw = container ? (container.clientWidth || 660) : 660;
    const ch = container ? (container.clientHeight || 560) : 560;

    const maxCellHByHeight = ch / ROWS;
    const maxCellHByWidth = cw / (COLS * CHAR_ASPECT);
    cellH = Math.max(4.5, Math.min(maxCellHByHeight, maxCellHByWidth));
    cellW = cellH * CHAR_ASPECT;
    fontSize = Math.round(cellH * 0.94);

    const totalW = Math.ceil(COLS * cellW);
    const totalH = Math.ceil(ROWS * cellH);

    canvas.style.width = `${totalW}px`;
    canvas.style.height = `${totalH}px`;
    canvas.width = Math.round(totalW * dpr);
    canvas.height = Math.round(totalH * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const DEG2RAD = Math.PI / 180;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const smootherstep = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  function latLonToVec3(latDeg, lonDeg) {
    const phi = latDeg * DEG2RAD;
    const theta = lonDeg * DEG2RAD;
    return {
      x: Math.cos(phi) * Math.sin(theta),
      y: Math.sin(phi),
      z: Math.cos(phi) * Math.cos(theta)
    };
  }

  const RAW_LAND_CLUSTERS = [
    // Europe
    [40.2, -4.2, 5.2, 1.48], [46.8, 2.2, 5.5, 1.45], [50.8, 10.2, 5.8, 1.48],
    [52.5, 19.5, 6.2, 1.44], [42.5, 12.8, 3.2, 1.38], [39.8, 16.2, 2.6, 1.28],
    [41.5, 22.5, 4.4, 1.38], [46.8, 25.0, 5.0, 1.38], [50.0, 31.5, 6.8, 1.38],
    [54.2, -2.2, 3.4, 1.45], [57.2, -4.2, 2.5, 1.30], [53.2, -8.0, 2.3, 1.25],
    [61.5, 8.5, 4.6, 1.44], [63.5, 16.5, 5.2, 1.44], [68.5, 20.5, 4.8, 1.38],
    [62.5, 26.5, 4.5, 1.35], [57.5, 25.5, 3.8, 1.30], [57.5, 40.5, 9.0, 1.38],
    // Sea Carves Europe
    [38.0, 6.0, 4.8, -1.40], [35.2, 18.5, 5.2, -1.45], [43.2, 34.0, 4.2, -1.30],
    [56.0, 3.2, 3.6, -1.15], [58.0, 19.5, 2.8, -1.00], [45.0, -8.5, 3.8, -1.15],
    // North America
    [39.5, -120.5, 5.8, 1.48], [46.5, -121.0, 5.5, 1.44], [40.0, -105.5, 8.2, 1.52],
    [39.0, -92.0, 7.8, 1.52], [33.0, -98.5, 6.2, 1.44], [35.5, -80.5, 5.5, 1.48],
    [41.5, -74.5, 5.2, 1.48], [27.8, -81.6, 2.8, 1.48], [23.5, -102.5, 5.2, 1.38],
    [19.0, -96.0, 4.0, 1.32], [20.5, -88.5, 2.6, 1.22], [14.5, -86.5, 3.2, 1.18],
    [22.0, -79.5, 2.2, 1.10], [54.5, -112.0, 8.8, 1.42], [53.0, -96.0, 7.5, 1.38],
    [52.0, -71.0, 7.0, 1.42], [66.0, -105.0, 6.5, 1.30], [63.5, -150.0, 7.2, 1.38],
    [65.0, -132.0, 6.5, 1.32], [73.5, -42.0, 8.8, 1.45], [65.0, -18.0, 2.5, 1.25],
    // Sea Carves North America
    [25.0, -90.5, 5.5, -1.48], [59.5, -85.0, 5.8, -1.40], [45.5, -84.5, 3.4, -0.90],
    [27.0, -74.0, 4.8, -1.25], [68.0, -58.0, 4.8, -1.20],
    // South America
    [4.5, -73.0, 6.5, 1.35], [-5.0, -65.0, 8.5, 1.45], [-7.5, -48.0, 8.8, 1.45],
    [-18.0, -56.0, 7.5, 1.40], [-28.0, -62.0, 5.8, 1.35],
    // Africa
    [31.5, -5.0, 5.8, 1.35], [27.0, 9.0, 8.8, 1.45], [26.0, 26.0, 8.2, 1.40],
    [13.5, -8.0, 6.8, 1.40], [11.0, 18.0, 8.5, 1.45], [6.0, 38.0, 6.5, 1.35],
    [-6.0, 26.0, 8.0, 1.45],
    // Asia & Middle East
    [39.0, 35.0, 4.8, 1.38], [25.0, 45.0, 6.2, 1.38], [32.0, 54.0, 6.5, 1.38],
    [61.0, 68.0, 11.0, 1.38], [63.0, 105.0, 12.0, 1.38], [45.0, 76.0, 9.5, 1.40],
    [35.0, 96.0, 10.5, 1.45], [35.0, 114.0, 7.8, 1.40], [22.0, 78.0, 6.2, 1.40],
    [37.0, 138.0, 3.2, 1.22]
  ];

  const CONTINENT_BLOBS = RAW_LAND_CLUSTERS.map(([lat, lon, radDeg, amp]) => {
    const v = latLonToVec3(lat, lon);
    return {
      x: v.x, y: v.y, z: v.z,
      invSpread: 1 / Math.pow(radDeg * DEG2RAD, 2),
      amp
    };
  });

  function sampleLandmass(wx, wy, wz) {
    let density = 0;
    for (let i = 0; i < CONTINENT_BLOBS.length; i++) {
      const b = CONTINENT_BLOBS[i];
      const dot = wx * b.x + wy * b.y + wz * b.z;
      if (dot > 0.72) {
        const distSq = 2 * (1 - dot);
        density += b.amp * Math.exp(-distSq * b.invSpread);
      }
    }
    const micro = 0.06 * Math.sin(wx * 26.0 + wy * 20.0) * Math.cos(wz * 24.0 - wx * 18.0);
    return density + micro;
  }

  const NUM_AMBIENT_STARS = 96;
  const AMBIENT_STARS = [];
  for (let i = 0; i < NUM_AMBIENT_STARS; i++) {
    const h1 = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    const h2 = Math.sin(i * 269.5 + 183.3) * 43758.5453;
    const h3 = Math.sin(i * 419.2 + 97.1) * 43758.5453;
    const u = h1 - Math.floor(h1);
    const v = h2 - Math.floor(h2);
    const w = h3 - Math.floor(h3);

    let nx = (u * 2 - 1) * 1.92;
    let ny = (v * 2 - 1) * 1.72;
    const dist = Math.sqrt(nx * nx * 0.62 + ny * ny);
    if (dist < 1.18) {
      const angle = Math.atan2(ny, nx);
      const pushedR = 1.22 + u * 0.65;
      nx = Math.cos(angle) * pushedR * 1.35;
      ny = Math.sin(angle) * pushedR * 0.96;
    }

    AMBIENT_STARS.push({
      baseNx: nx, baseNy: ny,
      phase: w * Math.PI * 2,
      speed: 1.4 + (i % 5) * 0.6,
      tier: i % 3
    });
  }

  const CYCLE_DURATION = 24.0;

  function getTimelineState(t) {
    const startYaw = -0.95;
    const totalRotations = 2 * Math.PI * 2;
    const linearProgress = t / CYCLE_DURATION;
    const spinAccent = 0.14 * Math.sin(linearProgress * Math.PI * 2 - 0.65) + 0.14 * Math.sin(-0.65);
    const globeYaw = startYaw + totalRotations * clamp(linearProgress + spinAccent * 0.18, 0, 1);

    let orbitAlpha = 0.38;
    if (t >= 7.4 && t < 9.6) {
      orbitAlpha = lerp(0.38, 1.0, smootherstep(7.4, 9.6, t));
    } else if (t >= 9.6 && t <= 19.6) {
      orbitAlpha = 1.0;
    } else if (t > 19.6 && t <= 22.8) {
      orbitAlpha = lerp(1.0, 0.38, smootherstep(19.6, 22.8, t));
    }

    let darkSide = 0.0;
    if (t >= 9.8 && t < 13.2) {
      darkSide = smootherstep(9.8, 13.2, t);
    } else if (t >= 13.2 && t <= 19.4) {
      darkSide = 1.0;
    } else if (t > 19.4 && t <= 23.0) {
      darkSide = 1.0 - smootherstep(19.4, 23.0, t);
    }

    let pupilScaleMorph = 0.0;
    if (t >= 10.2 && t < 13.8) {
      pupilScaleMorph = smootherstep(10.2, 13.8, t);
    } else if (t >= 13.8 && t <= 19.2) {
      pupilScaleMorph = 1.0;
    } else if (t > 19.2 && t <= 23.2) {
      pupilScaleMorph = 1.0 - smootherstep(19.2, 23.2, t);
    }

    let eyeMorph = 0.0;
    if (t >= 10.0 && t < 13.8) {
      eyeMorph = smootherstep(10.0, 13.8, t);
    } else if (t >= 13.8 && t <= 19.2) {
      eyeMorph = 1.0;
    } else if (t > 19.2 && t <= 23.0) {
      eyeMorph = 1.0 - smootherstep(19.2, 23.0, t);
    }

    return { globeYaw, orbitAlpha, darkSide, pupilScaleMorph, eyeMorph };
  }

  function getEyeGazeState(t) {
    if (t < 13.4 || t > 19.6) {
      return { gx: 0, gy: 0, blink: 0, squint: 0 };
    }

    const keys = [
      [13.40,  0.00,  0.00, 0.00],
      [14.00,  0.00,  0.00, 0.04],
      [14.65, -0.54,  0.30, 0.14],
      [15.55, -0.60,  0.34, 0.18],
      [16.10, -0.38,  0.54, 0.24],
      [17.05, -0.44,  0.58, 0.26],
      [17.60, -0.68,  0.38, 0.20],
      [18.45, -0.62,  0.34, 0.16],
      [19.20,  0.00,  0.00, 0.00],
      [19.60,  0.00,  0.00, 0.00]
    ];

    let gx = 0, gy = 0, squint = 0;
    for (let i = 0; i < keys.length - 1; i++) {
      const k0 = keys[i], k1 = keys[i + 1];
      if (t >= k0[0] && t <= k1[0]) {
        const p = smootherstep(k0[0], k1[0], t);
        gx = lerp(k0[1], k1[1], p);
        gy = lerp(k0[2], k1[2], p);
        squint = lerp(k0[3], k1[3], p);
        break;
      }
    }

    let blink = 0;
    const blinkCenter = 17.22;
    const blinkHalfWidth = 0.14;
    if (Math.abs(t - blinkCenter) < blinkHalfWidth) {
      const bp = 1 - Math.abs(t - blinkCenter) / blinkHalfWidth;
      blink = smoothstep(0, 1, bp);
    }

    return { gx, gy, blink, squint };
  }

  function projectGlobeVecToScreen(vx, vy, vz, cosYaw, sinYaw, cosTilt, sinTilt) {
    const rx = vx * cosYaw - vz * sinYaw;
    const ry = vy;
    const rz = vx * sinYaw + vz * cosYaw;
    const ty = ry * cosTilt - rz * sinTilt;
    const tz = ry * sinTilt + rz * cosTilt;
    return { sx: rx, sy: -ty, sz: tz };
  }

  function setCell(c, r, char, color, weight = 700, prio = 10) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      const cell = grid[r][c];
      if (prio >= cell.prio) {
        cell.char = char;
        cell.color = color;
        cell.weight = weight;
        cell.prio = prio;
      }
    }
  }

  function stampVolumetricBrush(centerXCols, centerYRows, halfThickRows, coreColor, edgeColor, coreChar, edgeChar, prioBase) {
    const minR = Math.floor(centerYRows - halfThickRows - 0.5);
    const maxR = Math.ceil(centerYRows + halfThickRows + 0.5);
    const halfThickCols = halfThickRows / CHAR_ASPECT;
    const minC = Math.floor(centerXCols - halfThickCols - 0.5);
    const maxC = Math.ceil(centerXCols + halfThickCols + 0.5);

    for (let r = minR; r <= maxR; r++) {
      const dy = r - centerYRows;
      for (let c = minC; c <= maxC; c++) {
        const dx = (c - centerXCols) * CHAR_ASPECT;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= halfThickRows) {
          const norm = dist / Math.max(0.001, halfThickRows);
          if (norm <= 0.62) {
            setCell(c, r, coreChar, coreColor, 800, prioBase + 2);
          } else {
            setCell(c, r, edgeChar, edgeColor, 700, prioBase + 1);
          }
        }
      }
    }
  }

  function renderUnifiedOrbitAndEyeContour(passType, t, orbitAlpha, eyeMorph, gx, gy, blink, squint, centerCol, centerRow) {
    if (orbitAlpha <= 0.02) return;

    const contourHalfW = lerp(1.44, 1.35, eyeMorph);
    const ringRoll = lerp(-0.24, 0.0, eyeMorph);
    const cosRoll = Math.cos(ringRoll);
    const sinRoll = Math.sin(ringRoll);
    const orbitTiltY = 0.38;
    const eyeOpenArchH = 0.66 * (1 - 0.88 * blink - 0.16 * squint);
    const numSamples = 320;

    if (passType === 'front' && eyeMorph > 0.35) {
      const lashFade = smoothstep(0.35, 0.85, eyeMorph);
      for (let i = 0; i < numSamples; i++) {
        const theta = (i / numSamples) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const ax = Math.abs(cosT);
        const signY = sinT >= 0 ? 1 : -1;

        const almondArch = Math.pow(Math.max(0, 1.0 - cosT * cosT), 0.76);
        const lidGazeShift = (signY < 0 ? gy * 0.18 : gy * 0.10) * (1 - ax * 0.55);
        const eyeX = contourHalfW * cosT + gx * 0.10;
        const eyeY = signY * eyeOpenArchH * almondArch + lidGazeShift;
        const eyeHalfThick = 1.12 * (1 - ax * 0.35);

        if (i % 3 === 0 && ax < 0.90) {
          const shDistRows = eyeHalfThick + 1.6;
          const shXCols = centerCol + (eyeX * BASE_GLOBE_RADIUS) / CHAR_ASPECT;
          const shYRows = centerRow + eyeY * BASE_GLOBE_RADIUS + signY * shDistRows;
          setCell(Math.round(shXCols), Math.round(shYRows), ':', PALETTE.inkFaint, 400, 11);
          if (i % 6 === 0) {
            setCell(Math.round(shXCols), Math.round(shYRows + signY), '·', PALETTE.inkWhisper, 400, 10);
          }
        }

        if (ax >= 0.42 && ax <= 0.88) {
          const lashWave = Math.cos(theta * 22.0);
          if (lashWave > 0.72) {
            const maxSteps = Math.round((signY < 0 ? 3 : 2) * lashFade);
            const lashChar = (cosT < 0) ? (signY < 0 ? '\\' : '/') : (signY < 0 ? '/' : '\\');
            for (let s = 1; s <= maxSteps; s++) {
              const radialOut = (eyeHalfThick + 0.85 + s * 0.95) / BASE_GLOBE_RADIUS;
              const lx = eyeX + cosT * radialOut * 0.85;
              const ly = eyeY + signY * radialOut * 0.95;
              const lc = Math.round(centerCol + (lx * BASE_GLOBE_RADIUS) / CHAR_ASPECT);
              const lr = Math.round(centerRow + ly * BASE_GLOBE_RADIUS);
              setCell(lc, lr, lashChar, s === 1 ? PALETTE.inkMid : PALETTE.inkSoft, 600, 14);
            }
          }
        }
      }
    }

    for (let i = 0; i < numSamples; i++) {
      const theta = (i / numSamples) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const ax = Math.abs(cosT);
      const signY = sinT >= 0 ? 1 : -1;

      const zDepth = lerp(sinT, 0.5, eyeMorph);
      const isBackHalf = zDepth < 0;
      if (passType === 'back' && !isBackHalf) continue;
      if (passType === 'front' && isBackHalf) continue;

      const rawRingX = contourHalfW * cosT;
      const rawRingY = contourHalfW * orbitTiltY * sinT;
      const ringX = rawRingX * cosRoll - rawRingY * sinRoll;
      const ringY = rawRingX * sinRoll + rawRingY * cosRoll;

      const almondArch = Math.pow(Math.max(0, 1.0 - cosT * cosT), 0.76);
      const lidGazeShift = (signY < 0 ? gy * 0.18 : gy * 0.10) * (1 - ax * 0.55);
      const eyeX = contourHalfW * cosT + gx * 0.10;
      const eyeY = signY * eyeOpenArchH * almondArch + lidGazeShift;

      const nx = lerp(ringX, eyeX, eyeMorph);
      const ny = lerp(ringY, eyeY, eyeMorph);

      const centerXCols = centerCol + (nx * BASE_GLOBE_RADIUS) / CHAR_ASPECT;
      const centerYRows = centerRow + ny * BASE_GLOBE_RADIUS;

      const ringHalfThick = (isBackHalf ? 1.55 : 2.55) * (0.72 + 0.28 * orbitAlpha);
      const eyeHalfThick = lerp(1.12, 0.82, Math.pow(ax, 1.4));
      const halfThickRows = lerp(ringHalfThick, eyeHalfThick, eyeMorph);

      const flowWave = Math.sin(theta * 10.0 - t * 2.4);

      if (isBackHalf) {
        const backCoreChar = eyeMorph > 0.35 ? '#' : (flowWave > 0.1 ? '%' : '=');
        const backEdgeChar = eyeMorph > 0.35 ? '=' : (flowWave > -0.2 ? ':' : '.');
        const backCoreColor = eyeMorph < 0.5 ? PALETTE.inkSoft : PALETTE.inkDark;
        const backEdgeColor = eyeMorph < 0.5 ? PALETTE.inkFaint : PALETTE.inkMid;

        stampVolumetricBrush(centerXCols, centerYRows, halfThickRows, backCoreColor, backEdgeColor, backCoreChar, backEdgeChar, 6);
      } else {
        const isOrbitBeacon = (eyeMorph < 0.5) && (Math.sin(theta * 4.0 - t * 2.6) > 0.86);
        const coreChar = eyeMorph > 0.45 ? '@' : (isOrbitBeacon ? '@' : (flowWave > 0.0 ? '@' : '#'));
        const edgeChar = eyeMorph > 0.45 ? '#' : (flowWave > -0.2 ? '%' : '=');
        const coreColor = PALETTE.inkDeep;
        const edgeColor = eyeMorph > 0.45 ? PALETTE.inkDark : PALETTE.inkMid;

        stampVolumetricBrush(centerXCols, centerYRows, halfThickRows, coreColor, edgeColor, coreChar, edgeChar, 32);

        if (eyeMorph > 0.5 && ax > 0.92) {
          const cTip = Math.round(centerXCols);
          const rTip = Math.round(centerYRows);
          setCell(cTip, rTip, '@', PALETTE.inkDeep, 800, 35);
          setCell(cTip + (cosT > 0 ? 1 : -1), rTip, '#', PALETTE.inkDark, 800, 34);
        }
      }
    }
  }

  function renderFrame(nowMs) {
    const t = ((nowMs * 0.001) % CYCLE_DURATION + CYCLE_DURATION) % CYCLE_DURATION;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        cell.char = ' ';
        cell.color = PALETTE.inkDeep;
        cell.weight = 400;
        cell.prio = 0;
      }
    }

    const { globeYaw, orbitAlpha, darkSide, pupilScaleMorph, eyeMorph } = getTimelineState(t);
    const { gx, gy, blink, squint } = getEyeGazeState(t);

    const centerCol = (COLS - 1) * 0.5;
    const centerRow = (ROWS - 1) * 0.5;

    const tilt = 0.43 * (1 - eyeMorph * 0.45);
    const cosTilt = Math.cos(tilt), sinTilt = Math.sin(tilt);
    const cosYaw = Math.cos(globeYaw), sinYaw = Math.sin(globeYaw);

    const currentSphereRadiusRows = lerp(BASE_GLOBE_RADIUS, PUPIL_RADIUS, pupilScaleMorph);
    const sphereRadiusNorm = currentSphereRadiusRows / BASE_GLOBE_RADIUS;

    const pupilShiftX = gx * 0.44 * eyeMorph;
    const pupilShiftY = gy * 0.28 * eyeMorph;

    const contourHalfW = lerp(1.44, 1.35, eyeMorph);
    const eyeOpenArchH = 0.66 * (1 - 0.88 * blink - 0.16 * squint);

    const sunX = -0.32, sunY = -0.35, sunZ = 0.88;

    // Pass 1: Stars
    for (let i = 0; i < AMBIENT_STARS.length; i++) {
      const star = AMBIENT_STARS[i];
      const driftX = Math.sin(t * 0.42 + star.phase) * 0.035 * (1 - eyeMorph);
      const driftY = Math.cos(t * 0.36 + star.phase) * 0.035 * (1 - eyeMorph);
      const nx = star.baseNx + driftX + gx * 0.05 * eyeMorph;
      const ny = star.baseNy + driftY + gy * 0.04 * eyeMorph;
      const c = Math.round(centerCol + (nx * BASE_GLOBE_RADIUS) / CHAR_ASPECT);
      const r = Math.round(centerRow + ny * BASE_GLOBE_RADIUS);

      if (r >= 1 && r < ROWS - 1 && c >= 1 && c < COLS - 1) {
        const twinkle = Math.sin(t * star.speed + star.phase);
        if (star.tier === 0) {
          setCell(c, r, twinkle > 0.3 ? '*' : '+', twinkle > 0.3 ? PALETTE.inkMid : PALETTE.inkFaint, 700, 2);
        } else if (star.tier === 1) {
          setCell(c, r, twinkle > 0 ? '+' : '·', PALETTE.inkFaint, 400, 2);
        } else {
          setCell(c, r, twinkle > -0.2 ? '.' : '·', PALETTE.inkWhisper, 400, 2);
        }
      }
    }

    // Pass 2: Back half of orbit
    renderUnifiedOrbitAndEyeContour('back', t, orbitAlpha, eyeMorph, gx, gy, blink, squint, centerCol, centerRow);

    // Pass 3: Sclera + Globe/Pupil
    for (let r = 0; r < ROWS; r++) {
      const ny = (r - centerRow) / BASE_GLOBE_RADIUS;
      for (let c = 0; c < COLS; c++) {
        const nx = ((c - centerCol) * CHAR_ASPECT) / BASE_GLOBE_RADIUS;
        const gazeSkewX = nx - gx * 0.10 * eyeMorph;
        const ax = Math.abs(gazeSkewX) / contourHalfW;
        let insideEyeOpening = true;
        let distToUpperLid = 1.0;

        if (eyeMorph > 0.55) {
          if (ax < 0.96) {
            const arch = Math.pow(Math.max(0, 1.0 - ax * ax), 0.76);
            const topY = -eyeOpenArchH * arch + gy * 0.18 * (1 - ax * 0.55);
            const botY =  eyeOpenArchH * arch + gy * 0.10 * (1 - ax * 0.55);
            insideEyeOpening = ny > topY && ny < botY;
            distToUpperLid = ny - topY;

            if (insideEyeOpening && eyeMorph > 0.75) {
              if (distToUpperLid < 0.07) {
                setCell(c, r, ':', PALETTE.inkSoft, 600, 16);
              } else if (distToUpperLid < 0.13 || ax > 0.82) {
                if ((r + c) % 2 === 0) setCell(c, r, '·', PALETTE.inkFaint, 400, 15);
              }
            }
          } else {
            insideEyeOpening = false;
          }
        }

        const sx = (nx - pupilShiftX) / sphereRadiusNorm;
        const sy = (ny - pupilShiftY) / sphereRadiusNorm;
        const rSq = sx * sx + sy * sy;

        if (rSq <= 1.0 && insideEyeOpening) {
          const sz = Math.sqrt(Math.max(0, 1.0 - rSq));
          const rDist = Math.sqrt(rSq);
          const northY = -sy;
          const ry =  northY * cosTilt + sz * sinTilt;
          const rz = -northY * sinTilt + sz * cosTilt;
          const wx =  sx * cosYaw + rz * sinYaw;
          const wy =  ry;
          const wz = -sx * sinYaw + rz * cosYaw;

          const land = sampleLandmass(wx, wy, wz);
          const dayLambert = Math.max(0.15, sx * sunX + sy * sunY + sz * sunZ);

          const terminatorEdge = 1.45 - darkSide * 2.90;
          const localDarkness = smoothstep(terminatorEdge - 0.52, terminatorEdge + 0.52, sx + (1 - sz) * 0.25);

          let dayChar = ' ';
          let dayColor = PALETTE.inkDeep;
          let dayWeight = 400;

          if (rDist > 0.96) {
            dayChar = rDist > 0.98 ? '.' : ':';
            dayColor = PALETTE.inkMid;
            dayWeight = 600;
          } else if (land > 0.52) {
            const relief = land * (0.74 + 0.36 * dayLambert);
            if (relief > 1.24) { dayChar = '@'; dayColor = PALETTE.inkDeep; dayWeight = 800; }
            else if (relief > 1.02) { dayChar = 'W'; dayColor = PALETTE.inkDeep; dayWeight = 800; }
            else if (relief > 0.84) { dayChar = '#'; dayColor = PALETTE.inkDeep; dayWeight = 700; }
            else if (relief > 0.68) { dayChar = '%'; dayColor = PALETTE.inkDark; dayWeight = 700; }
            else { dayChar = '*'; dayColor = PALETTE.inkMid; dayWeight = 600; }
          } else {
            if (rDist > 0.88) { dayChar = (r + c) % 2 === 0 ? ':' : '.'; dayColor = PALETTE.inkSoft; }
            else if (rDist > 0.75 && (r + c) % 2 === 0) { dayChar = '.'; dayColor = PALETTE.inkFaint; }
            else if (rDist > 0.62 && (r * 3 + c * 5) % 9 === 0) { dayChar = '·'; dayColor = PALETTE.inkWhisper; }
            else { dayChar = ' '; dayColor = PALETTE.bg; }
          }

          let darkChar = '@';
          let darkColor = PALETTE.inkDeep;
          let darkWeight = 800;

          if (rDist > 0.90) {
            darkChar = rDist > 0.95 ? '=' : '#';
            darkColor = PALETTE.inkDark;
            darkWeight = 800;
          } else if (sx > 0.28 && sy < -0.24 && rDist > 0.42 && rDist < 0.74) {
            darkChar = '%';
            darkColor = PALETTE.inkDark;
            darkWeight = 700;
          } else {
            darkChar = (r + c) % 3 === 0 ? '#' : '@';
            darkColor = PALETTE.inkDeep;
            darkWeight = 800;
          }

          if (localDarkness >= 0.88) {
            setCell(c, r, darkChar, darkColor, darkWeight, 22);
          } else if (localDarkness <= 0.12) {
            setCell(c, r, dayChar, dayColor, dayWeight, 22);
          } else {
            if (localDarkness > 0.68) {
              setCell(c, r, '#', PALETTE.inkDeep, 700, 22);
            } else if (localDarkness > 0.48) {
              setCell(c, r, '%', PALETTE.inkDark, 700, 22);
            } else if (localDarkness > 0.28) {
              setCell(c, r, dayChar === ' ' ? '*' : dayChar, PALETTE.inkMid, 600, 22);
            } else {
              setCell(c, r, dayChar === ' ' ? ':' : dayChar, PALETTE.inkSoft, 600, 22);
            }
          }
        }
      }
    }

    // Pass 4: Front orbit / Eye contour
    renderUnifiedOrbitAndEyeContour('front', t, orbitAlpha, eyeMorph, gx, gy, blink, squint, centerCol, centerRow);

    // Pass 5: Clear and paint to canvas
    ctx.clearRect(0, 0, COLS * cellW, ROWS * cellH);

    let currentFontWeight = -1;
    let currentColor = '';

    for (let r = 0; r < ROWS; r++) {
      const y = (r + 0.5) * cellH;
      const rowCells = grid[r];

      for (let c = 0; c < COLS; c++) {
        const cell = rowCells[c];
        if (cell.char === ' ') continue;

        if (cell.weight !== currentFontWeight) {
          currentFontWeight = cell.weight;
          ctx.font = `${currentFontWeight} ${fontSize}px 'JetBrains Mono', monospace`;
        }
        if (cell.color !== currentColor) {
          currentColor = cell.color;
          ctx.fillStyle = currentColor;
        }

        const x = (c + 0.5) * cellW;
        ctx.fillText(cell.char, x, y);
      }
    }

    requestAnimationFrame(renderFrame);
  }

  requestAnimationFrame(renderFrame);
})();
