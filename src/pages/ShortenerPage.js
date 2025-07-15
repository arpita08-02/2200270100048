import { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import Header from '../components/Header';
import UrlForm from '../components/UrlForm';  // Changed to match actual filename
import UrlList from '../components/UrlList';
import { getUrls } from '../utils/storage';
import logger from '../utils/logger';

export default function ShortenerPage() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const storedUrls = getUrls();
    setUrls(storedUrls);
    logger.log('PAGE_LOADED', { page: 'Shortener' });
  }, []);

  const handleAddUrl = (newUrls) => {
    setUrls(newUrls);
  };

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <UrlForm onAddUrl={handleAddUrl} />
        <UrlList urls={urls} />
      </Container>
    </>
  );
}