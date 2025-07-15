import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { incrementClickCount } from '../utils/storage';
import logger from '../utils/logger';

function RedirectHandler() {
  const { shortCode } = useParams();

  useEffect(() => {
    const updatedUrls = incrementClickCount(shortCode);
    logger.log('REDIRECTED', { shortCode });
    const url = updatedUrls.find(u => u.shortCode === shortCode);
    if (url) {
      alert(`Redirecting to: ${url.longUrl}`);
      // In a real app, use window.location.replace(url.longUrl);
    }
  }, [shortCode]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Redirecting...</h2>
      <p>This would redirect to the original URL in a real app.</p>
    </div>
  );
}

export default RedirectHandler;