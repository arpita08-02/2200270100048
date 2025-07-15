import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShortenerPage from './pages/ShortenerPage';
import StatsPage from './pages/StatsPage';  // Changed to match actual filename
import UrlStats from './components/UrlStats';  // Changed to match actual filename
import { incrementClickCount } from './utils/storage';
import logger from './utils/logger';
import RedirectHandler from './components/RedirectHandler';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ShortenerPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/stats/:shortCode" element={<UrlStats />} />
        <Route 
          path="/:shortCode" 
          element={<RedirectHandler />}
          loader={({ params }) => {
            incrementClickCount(params.shortCode);
            logger.log('REDIRECT_ATTEMPT', { shortCode: params.shortCode });
            return null;
          }}
        />
      </Routes>
    </Router>
  );
}

export default App;