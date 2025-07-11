// ... existing code ...

(async () => {
  const server = await registerRoutes(app);
  
  // Add this check before serving static files
  const distPath = path2.resolve(import.meta.dirname, "../client/dist");
  if (!fs.existsSync(distPath)) {
    console.error(`FATAL: Client dist directory not found at ${distPath}`);
    console.error("Run 'npm run build' in client directory before starting server");
    process.exit(1);
  }

  // ... rest of existing code ...
})();
