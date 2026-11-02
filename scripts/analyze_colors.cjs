const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath.startsWith('/')) reqPath = reqPath.slice(1);
  const filePath = path.resolve(__dirname, '..', decodeURIComponent(reqPath));

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  let contentType = 'application/octet-stream';
  if (filePath.endsWith('.mov') || filePath.endsWith('.mp4')) contentType = 'video/mp4';
  if (filePath.endsWith('.html')) contentType = 'text/html';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

server.listen(8095, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const videoFiles = [
    '1st.mov', '2nd.mov', '3rd.mov', '4th.mov',
    '5th.mov', '6th.mov', '7th.mov', '8th.mov'
  ];

  const results = {};

  for (const vf of videoFiles) {
    await page.goto(`http://127.0.0.1:8095/scripts/player.html?v=${encodeURIComponent('videos/' + vf)}`);
    await page.waitForFunction(() => {
      const v = document.getElementById('v');
      return v && v.readyState >= 2;
    });

    const samples = await page.evaluate(async () => {
      const v = document.getElementById('v');
      const duration = v.duration;
      const pts = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9];
      const res = [];
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 36;
      const ctx = canvas.getContext('2d');

      for (const p of pts) {
        v.currentTime = duration * p;
        await new Promise(r => { v.onseeked = r; });
        ctx.drawImage(v, 0, 0, 64, 36);
        const data = ctx.getImageData(0, 0, 64, 36).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
          count++;
        }
        res.push({
          time: duration * p,
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count)
        });
      }
      return { duration, samples: res };
    });

    // Compute overall mean color
    let totR = 0, totG = 0, totB = 0;
    for (const s of samples.samples) {
      totR += s.r;
      totG += s.g;
      totB += s.b;
    }
    const n = samples.samples.length;
    const avgR = Math.round(totR / n);
    const avgG = Math.round(totG / n);
    const avgB = Math.round(totB / n);
    const hsl = rgbToHsl(avgR, avgG, avgB);

    // Create harmonized editorial page background:
    // Light palette matching the hue of the video with high lightness (95-97%) and subtle saturation (12-25%)
    // This maintains the iconic narrowdesign clean aesthetic while unmistakably bathing the page in the video's color vibe!
    const bgHsl = {
      h: hsl.h,
      s: Math.max(14, Math.min(38, hsl.s > 0 ? hsl.s : 18)),
      l: 96
    };
    const bgRgb = hslToRgb(bgHsl.h, bgHsl.s, bgHsl.l);
    const bgHex = rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);

    // Deep high-contrast text color tinted in the video's hue (lightness 10%, saturation 25%)
    const fgHsl = {
      h: hsl.h,
      s: 22,
      l: 9
    };
    const fgRgb = hslToRgb(fgHsl.h, fgHsl.s, fgHsl.l);
    const fgHex = rgbToHex(fgRgb.r, fgRgb.g, fgRgb.b);

    // Vibrant accent color
    const accentHsl = {
      h: hsl.h,
      s: 85,
      l: 45
    };
    const accentRgb = hslToRgb(accentHsl.h, accentHsl.s, accentHsl.l);
    const accentHex = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);

    results[vf] = {
      duration: samples.duration,
      avgRgb: { r: avgR, g: avgG, b: avgB },
      avgHex: rgbToHex(avgR, avgG, avgB),
      hsl,
      bgHex,
      fgHex,
      accentHex,
      samples: samples.samples
    };
  }

  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync(path.resolve(__dirname, 'detailed_colors.json'), JSON.stringify(results, null, 2));

  await browser.close();
  server.close();
  process.exit(0);
});
