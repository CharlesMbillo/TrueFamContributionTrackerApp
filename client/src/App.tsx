import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  return <div>Home Page</div>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
