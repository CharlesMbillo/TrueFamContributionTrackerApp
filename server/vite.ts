import express from 'express';
import fs from 'fs';
import path from 'path';

function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, '../client/dist');
  
  // Production: Serve built assets
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Only serve index.html for non-API routes
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(distPath, 'index.html'));
      } else {
        res.status(404).end();
      }
    });
    return;
  }

  // Development: Fallback message
  app.get('*', (_, res) => {
    res.status(404).send('Client not built - run "npm run build" in client directory');
  });
}

export { serveStatic };
