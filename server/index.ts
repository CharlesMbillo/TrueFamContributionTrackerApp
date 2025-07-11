import express from 'express';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());

(async () => {
  const server = await registerRoutes(app);
  
  // Production static serving
  const distPath = require('path').resolve(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(require('path').resolve(distPath, 'index.html'));
    } else {
      res.status(404).end();
    }
  });

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();
