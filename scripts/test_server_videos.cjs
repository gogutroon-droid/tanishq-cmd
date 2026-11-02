const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static server
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
  if (filePath.endsWith('.mov')) contentType = 'video/quicktime';
  if (filePath.endsWith('.mp4')) contentType = 'video/mp4';
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

server.listen(8091, async () => {
  console.log('Server running on 8091');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const videoFiles = [
    '1st.mov', '2nd.mov', '3rd.mov', '4th.mov',
    '5th.mov', '6th.mov', '7th.mov', '8th.mov'
  ];

  for (const vf of videoFiles) {
    await page.goto(`http://127.0.0.1:8091/scripts/player.html?v=${encodeURIComponent('videos/' + vf)}`);
    const res = await page.evaluate(async () => {
      const v = document.getElementById('v');
      return new Promise((resolve) => {
        v.onloadeddata = () => {
          resolve({ ok: true, duration: v.duration, width: v.videoWidth, height: v.videoHeight });
        };
        v.onerror = (e) => {
          resolve({ ok: false, code: v.error?.code, msg: v.error?.message });
        };
        setTimeout(() => resolve({ ok: false, error: 'timeout', readyState: v.readyState, networkState: v.networkState }), 5000);
      });
    });
    console.log(vf, res);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
