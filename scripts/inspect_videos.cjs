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
  if (filePath.endsWith('.mov')) contentType = 'video/mp4'; // Chromium prefers mp4 or video/quicktime
  if (filePath.endsWith('.mp4')) contentType = 'video/mp4';
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

server.listen(8092, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const videoFiles = [
    '1st.mov', '2nd.mov', '3rd.mov', '4th.mov',
    '5th.mov', '6th.mov', '7th.mov', '8th.mov'
  ];

  for (const vf of videoFiles) {
    await page.goto(`http://127.0.0.1:8092/scripts/player.html?v=${encodeURIComponent('videos/' + vf)}`);
    // wait for readyState >= 2
    await page.waitForFunction(() => {
      const v = document.getElementById('v');
      return v && v.readyState >= 2;
    }, { timeout: 10000 });

    const info = await page.evaluate(() => {
      const v = document.getElementById('v');
      return {
        duration: v.duration,
        width: v.videoWidth,
        height: v.videoHeight,
        readyState: v.readyState
      };
    });
    console.log(vf, info);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
