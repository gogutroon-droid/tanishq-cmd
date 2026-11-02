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
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
  if (filePath.endsWith('.png')) contentType = 'image/png';

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

server.listen(8093, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const videoFiles = [
    '1st.mov', '2nd.mov', '3rd.mov', '4th.mov',
    '5th.mov', '6th.mov', '7th.mov', '8th.mov'
  ];

  const analysis = [];

  for (const vf of videoFiles) {
    await page.goto(`http://127.0.0.1:8093/scripts/player.html?v=${encodeURIComponent('videos/' + vf)}`);
    await page.waitForFunction(() => {
      const v = document.getElementById('v');
      return v && v.readyState >= 2;
    });

    const fileBase = path.parse(vf).name;

    // Seek to 25% or 1s
    const frameData = await page.evaluate(async (fileBase) => {
      const v = document.getElementById('v');
      const seekTime = Math.min(2.5, v.duration * 0.3);
      v.currentTime = seekTime;
      await new Promise(r => {
        v.onseeked = r;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0, 320, 180);

      const imgData = ctx.getImageData(0, 0, 320, 180);
      const data = imgData.data;

      // Color sampling
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      const colorBins = {};

      for (let i = 0; i < data.length; i += 16) { // step by 4 pixels
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        rSum += r;
        gSum += g;
        bSum += b;
        count++;

        // Quantize to bin
        const qr = Math.round(r / 24) * 24;
        const qg = Math.round(g / 24) * 24;
        const qb = Math.round(b / 24) * 24;
        const key = `${qr},${qg},${qb}`;
        colorBins[key] = (colorBins[key] || 0) + 1;
      }

      const avgR = Math.round(rSum / count);
      const avgG = Math.round(gSum / count);
      const avgB = Math.round(bSum / count);

      // Sort bins
      const sortedBins = Object.entries(colorBins).sort((a, b) => b[1] - a[1]);
      const dominantTop = sortedBins.slice(0, 5).map(([k, v]) => {
        const [r, g, b] = k.split(',').map(Number);
        return { r, g, b, weight: v };
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      return {
        duration: v.duration,
        avgR, avgG, avgB,
        dominantTop,
        dataUrl
      };
    }, fileBase);

    // Save thumbnail
    const base64Data = frameData.dataUrl.replace(/^data:image\/jpeg;base64,/, "");
    const thumbPath = path.resolve(__dirname, `../thumbnails/${fileBase}.jpg`);
    fs.writeFileSync(thumbPath, base64Data, 'base64');

    analysis.push({
      video: `videos/${vf}`,
      name: vf,
      duration: frameData.duration,
      avgColor: { r: frameData.avgR, g: frameData.avgG, b: frameData.avgB },
      dominantTop: frameData.dominantTop,
      thumb: `thumbnails/${fileBase}.jpg`
    });
  }

  fs.writeFileSync(
    path.resolve(__dirname, 'video_analysis.json'),
    JSON.stringify(analysis, null, 2)
  );

  console.log('Video analysis completed successfully!');
  await browser.close();
  server.close();
  process.exit(0);
});
