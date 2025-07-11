import express from 'express';
import fs from 'fs';
import path from 'path';

function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, '../client/dist');
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    return;
  }

  app.get('*', (_, res) => {
    res.status(404).send('Client not built - run "npm run build" in client directory');
  });
}

export { serveStatic };
