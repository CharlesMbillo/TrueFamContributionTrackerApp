import express from 'express';
import fs from 'fs';
import path from 'path';

function serveStatic(app: express.Express) {
  const distPath = path.resolve(__dirname, '../client/dist');
  
  // Production: Serve built assets
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api')) return res.status(404).end();
      
      // Serve index.html for all non-API routes
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    return;
  }

  // Development: Fallback message
  app.get('*', (_, res) => {
    res.status(404).send('Client not built - run "npm run build" in client directory');
  });
}

export { serveStatic };
