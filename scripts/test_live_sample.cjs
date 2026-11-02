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

server.listen(8097, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://127.0.0.1:8097/scripts/player.html?v=videos/2nd.mov');
  await page.waitForFunction(() => {
    const v = document.getElementById('v');
    return v && v.readyState >= 2;
  });

  const sampledColors = await page.evaluate(async () => {
    const v = document.getElementById('v');
    v.play();
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 9;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const results = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 200));
      ctx.drawImage(v, 0, 0, 16, 9);
      const d = ctx.getImageData(0, 0, 16, 9).data;
      let r = 0, g = 0, b = 0;
      for (let j = 0; j < d.length; j += 4) {
        r += d[j]; g += d[j+1]; b += d[j+2];
      }
      const count = d.length / 4;
      results.push({
        t: v.currentTime.toFixed(2),
        rgb: [Math.round(r/count), Math.round(g/count), Math.round(b/count)]
      });
    }
    return results;
  });

  console.log('Sampled live video colors:', sampledColors);

  await browser.close();
  server.close();
  process.exit(0);
});
