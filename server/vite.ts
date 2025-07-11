import express from 'express';
import fs from 'fs';
import path from 'path';

function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, '../dist/public');
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}`);
  }
  app.use(express.static(distPath));
  app.get('*', (_, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

export { serveStatic };
