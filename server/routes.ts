import express from 'express';

export async function registerRoutes(app: express.Express) {
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });
  
  // Return the express app for Vercel
  return app;
}
