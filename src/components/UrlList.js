import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  IconButton,
  Tooltip,
  Box,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import logger from '../utils/logger';

export default function UrlList({ urls, newUrlAdded = false }) {
  const [timeRemaining, setTimeRemaining] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);

  // Show success notification when a new URL is added
  useEffect(() => {
    if (newUrlAdded) {
      setSuccessOpen(true);
      // Reset the newUrlAdded flag after showing notification
      // (You might want to handle this differently based on your parent component)
    }
  }, [newUrlAdded, urls]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining = {};
      urls.forEach(url => {
        const now = new Date();
        const expires = new Date(url.expiresAt);
        const diff = expires - now;
        
        if (diff <= 0) {
          newTimeRemaining[url.shortCode] = 'Expired';
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newTimeRemaining[url.shortCode] = `${hours}h ${Math.round(minutes)}m`;
        }
      });
      setTimeRemaining(newTimeRemaining);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [urls]);

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    logger.log('URL_COPIED', { shortUrl });
  };

  const handleCloseSuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSuccessOpen(false);
  };

  const truncateUrl = (url, maxLength = 40) => {
    if (url.length <= maxLength) return url;
    return `${url.substring(0, maxLength)}...`;
  };

  const getClickPercentage = (url) => {
    if (!url.clickData || url.clickData.length === 0) return 0;
    
    const now = new Date();
    const created = new Date(url.createdAt);
    const totalHours = (now - created) / (1000 * 60 * 60);
    
    if (totalHours <= 0) return 100;
    return Math.min(100, (url.clicks / totalHours) * 100);
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Shortened URLs
        </Typography>
        {urls.length === 0 ? (
          <Typography>No URLs shortened yet</Typography>
        ) : (
          <List>
            {urls.map((url, index) => (
              <div key={url.shortCode}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Link 
                          to={`/${url.shortCode}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => logger.log('URL_CLICKED', { shortCode: url.shortCode })}
                          style={{ 
                            fontWeight: 'bold',
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {`${window.location.host}/${url.shortCode}`}
                        </Link>
                        <Tooltip title="Copy">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCopy(`${window.location.protocol}//${window.location.host}/${url.shortCode}`)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in new tab">
                          <IconButton 
                            size="small" 
                            component="a"
                            href={url.longUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    secondary={
                      <>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Original: {truncateUrl(url.longUrl)}
                            <Tooltip title={url.longUrl}>
                              <span>...</span>
                            </Tooltip>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Created: {new Date(url.createdAt).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Expires in: {timeRemaining[url.shortCode] || 'Calculating...'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography variant="body2">
                              Clicks: <strong>{url.clicks}</strong>
                            </Typography>
                            <Box sx={{ width: '100px' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={getClickPercentage(url)} 
                                color={getClickPercentage(url) > 70 ? 'success' : 'primary'}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                {index < urls.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        )}
      </Paper>

      {/* Success Notification */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          URL shortened successfully!
        </Alert>
      </Snackbar>
    </>
  );
}