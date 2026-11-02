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

// Best timestamp for each video
const videoTimestamps = {
  '1st.mov': 16.7, // GROW OR START SOMETHING NEW
  '2nd.mov': 19.8, // CRT monitor on bench with "its pity"
  '3rd.mov': 2.5,  // 4-panel collage with butterfly and creativity
  '4th.mov': 3.7,  // 4-quadrant motion showcase
  '5th.mov': 15.5, // Rakh Loon Tujhein couple illustration
  '6th.mov': 12.2, // Yeezus crimson player & chrome spheres
  '7th.mov': 2.4,  // Projector spotlight on "professional video-editor"
  '8th.mov': 14.8  // Currency exchange UI 250 EUR to BRL
};

server.listen(8096, async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const [vf, t] of Object.entries(videoTimestamps)) {
    await page.goto(`http://127.0.0.1:8096/scripts/player.html?v=${encodeURIComponent('videos/' + vf)}`);
    await page.waitForFunction(() => {
      const v = document.getElementById('v');
      return v && v.readyState >= 2;
    });

    const fileBase = path.parse(vf).name;

    const shot = await page.evaluate(async (t) => {
      const v = document.getElementById('v');
      v.currentTime = t;
      await new Promise(r => { v.onseeked = r; });
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0, 960, 540);
      return canvas.toDataURL('image/jpeg', 0.92);
    }, t);

    const base64Data = shot.replace(/^data:image\/jpeg;base64,/, "");
    const thumbPath = path.resolve(__dirname, `../thumbnails/${fileBase}.jpg`);
    fs.writeFileSync(thumbPath, base64Data, 'base64');
    console.log(`Generated thumbnail for ${vf} at ${t}s -> ${thumbPath}`);
  }

  await browser.close();
  server.close();
  process.exit(0);
});
