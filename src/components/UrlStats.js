import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getUrls } from '../utils/storage';
import logger from '../utils/logger';

export default function UrlStats() {
  const { shortCode } = useParams();
  const urls = getUrls();
  const url = urls.find(u => u.shortCode === shortCode);

  if (!url) {
    logger.log('STATS_NOT_FOUND', { shortCode });
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">URL not found</Typography>
      </Paper>
    );
  }

  logger.log('STATS_VIEWED', { shortCode });

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Statistics for {shortCode}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Original URL: {url.longUrl}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Created: {new Date(url.createdAt).toLocaleString()}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Expires: {new Date(url.expiresAt).toLocaleString()}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total Clicks: {url.clicks}
      </Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>Click Details</Typography>
      {url.clickData.length === 0 ? (
        <Typography>No clicks recorded</Typography>
      ) : (
        <List>
          {url.clickData.map((click, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={new Date(click.timestamp).toLocaleString()}
                  secondary={`From: ${click.source} | Location: ${click.location}`}
                />
              </ListItem>
              {index < url.clickData.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      )}
    </Paper>
  );
}